import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Injectable,
  Post,
  Query
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {IsEmail, IsOptional, IsString, MinLength} from 'class-validator';
import * as bcrypt from 'bcrypt';
import {PrismaService} from './prisma/prisma.service';

const trialDays = 14;

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({where: {email}});

    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name,
        trialEndsAt: this.trialEndDate()
      }
    });

    return this.authResponse(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({where: {email}});

    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    return this.authResponse(user);
  }

  async me(authorization?: string) {
    const userId = this.userIdFromHeader(authorization);
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        plan: true,
        trialEndsAt: true,
        vehicles: {
          orderBy: {createdAt: 'desc'},
          select: {
            id: true,
            make: true,
            model: true,
            productionYear: true,
            engine: true,
            vin: true,
            licensePlate: true,
            currentMileage: true
          }
        }
      }
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  googleAuthUrl() {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.googleRedirectUri();

    if (!clientId || !redirectUri) {
      return {
        configured: false,
        message: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CALLBACK_URL.'
      };
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });

    return {
      configured: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    };
  }

  async googleCallback(code: string) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.googleRedirectUri();

    if (!clientId || !clientSecret || !redirectUri) {
      throw new HttpException('Google OAuth is not configured', HttpStatus.BAD_REQUEST);
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new HttpException('Google token exchange failed', HttpStatus.BAD_REQUEST);
    }

    const tokenPayload = (await tokenResponse.json()) as {id_token?: string};
    const profileResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenPayload.id_token ?? ''}`
    );

    if (!profileResponse.ok) {
      throw new HttpException('Google profile verification failed', HttpStatus.BAD_REQUEST);
    }

    const profile = (await profileResponse.json()) as {
      sub: string;
      email: string;
      name?: string;
    };
    const email = profile.email.toLowerCase().trim();

    const user = await this.prisma.user.upsert({
      where: {email},
      update: {
        googleId: profile.sub,
        name: profile.name
      },
      create: {
        email,
        googleId: profile.sub,
        name: profile.name,
        trialEndsAt: this.trialEndDate()
      }
    });

    return this.authResponse(user);
  }

  userIdFromHeader(authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

    if (!token) {
      throw new HttpException('Missing bearer token', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = this.jwt.verify<{sub: string}>(token, {
        secret: this.jwtSecret()
      });
      return payload.sub;
    } catch {
      throw new HttpException('Invalid bearer token', HttpStatus.UNAUTHORIZED);
    }
  }

  private authResponse(user: {id: string; email: string; name: string | null; plan: string; trialEndsAt: Date | null}) {
    return {
      accessToken: this.jwt.sign(
        {
          sub: user.id,
          email: user.email
        },
        {
          secret: this.jwtSecret(),
          expiresIn: '7d'
        }
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt
      }
    };
  }

  private jwtSecret() {
    return this.config.get<string>('JWT_ACCESS_SECRET') ?? 'change-me-access';
  }

  private googleRedirectUri() {
    return this.config.get<string>('GOOGLE_CALLBACK_URL');
  }

  private trialEndDate() {
    const date = new Date();
    date.setDate(date.getDate() + trialDays);
    return date;
  }
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    return this.auth.me(authorization);
  }

  @Get('google/url')
  googleUrl() {
    return this.auth.googleAuthUrl();
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code?: string) {
    if (!code) {
      throw new HttpException('Missing Google code', HttpStatus.BAD_REQUEST);
    }

    const result = await this.auth.googleCallback(code);
    const frontend = this.config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:3333';
    return {
      ...result,
      nextStep: `Save accessToken in the frontend and redirect to ${frontend}`
    };
  }
}
