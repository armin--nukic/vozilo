import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceController {
  @Get('timeline')
  timeline() {
    return [
      {
        id: 'oil-service',
        title: 'Oil service',
        vehicle: 'Volkswagen Golf 7 2.0 TDI',
        dueIn: '1,600 km',
        severity: 'medium'
      },
      {
        id: 'registration',
        title: 'Registration renewal',
        vehicle: 'Skoda Karoq 2.0 TDI',
        dueIn: '28 days',
        severity: 'high'
      },
      {
        id: 'brake-check',
        title: 'Brake inspection',
        vehicle: 'BMW F30',
        dueIn: 'This month',
        severity: 'medium'
      }
    ];
  }
}
