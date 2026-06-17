import {Controller, Get, Headers} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth';
import {PrismaService} from './prisma/prisma.service';

@ApiTags('reports')
@Controller()
export class ReportsController {
  constructor(private readonly prisma: PrismaService, private readonly auth: AuthService) {}

  @Get('plans')
  plans() {
    return [
      {
        id: 'free',
        title: 'Free',
        priceMonthlyKm: 0,
        trialDays: 14,
        features: ['One vehicle', 'Forum access', 'Workshop search', 'Basic reminders']
      },
      {
        id: 'premium',
        title: 'Premium',
        priceMonthlyKm: 5,
        trialDays: 14,
        features: ['Unlimited vehicles', 'AI mechanic', 'PDF reports', 'Expense analytics', 'Advanced reminders']
      },
      {
        id: 'business',
        title: 'Business',
        priceMonthlyKm: 29,
        trialDays: 14,
        features: ['Workshop profile', 'Featured placement', 'Appointment requests', 'Premium visibility']
      }
    ];
  }

  @ApiBearerAuth()
  @Get('reports/sample')
  async sampleReport(@Headers('authorization') authorization?: string) {
    const vehicles = authorization
      ? await this.prisma.vehicle.findMany({
          where: {ownerId: this.auth.userIdFromHeader(authorization), deletedAt: null},
          orderBy: {createdAt: 'desc'}
        })
      : [
          {
            id: 'demo-golf-7',
            make: 'Volkswagen',
            model: 'Golf 7',
            productionYear: 2018,
            engine: '2.0 TDI',
            vin: null,
            licensePlate: 'A12-B-345',
            currentMileage: 142400,
            ownerId: 'demo',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          }
        ];

    return {
      title: 'Vozilo.ba monthly report',
      currency: 'KM',
      generatedAt: new Date().toISOString(),
      vehicles,
      summary: {
        totalVehicles: vehicles.length,
        estimatedMonthlyFuel: 180,
        estimatedMonthlyServiceReserve: 65,
        nextRecommendedAction: vehicles.length
          ? `Schedule oil service check for ${vehicles[0].make} ${vehicles[0].model}`
          : 'Add your first vehicle to generate a real report'
      },
      disclaimer: 'This is a sample report. Full PDF export belongs to Premium.'
    };
  }
}
