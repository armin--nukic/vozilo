import {Body, Controller, Get, Headers, Post} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {IsInt, IsOptional, IsString, Max, Min, MinLength} from 'class-validator';
import {AuthService} from './auth';
import {PrismaService} from './prisma/prisma.service';

class CreateVehicleDto {
  @IsString()
  @MinLength(2)
  make!: string;

  @IsString()
  @MinLength(1)
  model!: string;

  @IsInt()
  @Min(1950)
  @Max(2035)
  productionYear!: number;

  @IsString()
  @MinLength(2)
  engine!: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsInt()
  @Min(0)
  currentMileage!: number;
}

@ApiBearerAuth()
@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly prisma: PrismaService, private readonly auth: AuthService) {}

  @Get()
  list(@Headers('authorization') authorization?: string) {
    const ownerId = this.auth.userIdFromHeader(authorization);
    return this.prisma.vehicle.findMany({
      where: {ownerId, deletedAt: null},
      orderBy: {createdAt: 'desc'}
    });
  }

  @Post()
  create(@Headers('authorization') authorization: string | undefined, @Body() dto: CreateVehicleDto) {
    const ownerId = this.auth.userIdFromHeader(authorization);
    return this.prisma.vehicle.create({
      data: {
        ownerId,
        make: dto.make,
        model: dto.model,
        productionYear: dto.productionYear,
        engine: dto.engine,
        vin: dto.vin,
        licensePlate: dto.licensePlate,
        currentMileage: dto.currentMileage
      }
    });
  }
}
