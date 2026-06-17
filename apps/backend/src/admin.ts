import {Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch} from '@nestjs/common';
import {UserPlan, UserRole} from '@prisma/client';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {IsEnum, IsOptional} from 'class-validator';
import {AuthService} from './auth';
import {PrismaService} from './prisma/prisma.service';

class UpdateUserAccessDto {
  @IsOptional()
  @IsEnum(UserPlan)
  plan?: UserPlan;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService, private readonly auth: AuthService) {}

  @Get('users')
  async listUsers(@Headers('authorization') authorization?: string) {
    await this.auth.requireSuperAdmin(authorization);

    return this.prisma.user.findMany({
      where: {deletedAt: null},
      orderBy: {createdAt: 'desc'},
      select: {
        id: true,
        createdAt: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        trialEndsAt: true,
        _count: {
          select: {
            vehicles: true,
            topics: true
          }
        }
      }
    });
  }

  @Patch('users/:id')
  async updateUser(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateUserAccessDto
  ) {
    await this.auth.requireSuperAdmin(authorization);

    if (!dto.plan && !dto.role) {
      throw new HttpException('Provide plan or role', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.user.update({
      where: {id},
      data: {
        ...(dto.plan ? {plan: dto.plan} : {}),
        ...(dto.role ? {role: dto.role} : {})
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        trialEndsAt: true
      }
    });
  }
}
