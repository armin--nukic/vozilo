import {Body, Controller, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {IsOptional, IsString} from 'class-validator';

class DiagnoseDto {
  @IsString()
  symptoms!: string;

  @IsOptional()
  @IsString()
  vehicle?: string;
}

@ApiTags('ai-assistant')
@Controller('ai')
export class AiController {
  @Post('diagnose')
  diagnose(@Body() dto: DiagnoseDto) {
    const text = dto.symptoms.toLowerCase();
    const causes = [];

    if (text.includes('dim') || text.includes('smoke')) {
      causes.push('Turbo, EGR valve, injector imbalance, or worn piston rings');
    }
    if (text.includes('trese') || text.includes('vibr') || text.includes('shake')) {
      causes.push('Engine mount, misfire, dual-mass flywheel, or wheel balance');
    }
    if (text.includes('koci') || text.includes('brake') || text.includes('skrip')) {
      causes.push('Brake pads/discs wear, stuck caliper, or low brake fluid');
    }
    if (causes.length === 0) {
      causes.push('Sensor fault, maintenance interval overdue, or general mechanical inspection needed');
    }

    const severity = text.includes('crveno') || text.includes('staje') || text.includes('overheat') ? 'high' : 'medium';

    return {
      vehicle: dto.vehicle || 'Demo vehicle',
      symptoms: dto.symptoms,
      possibleCauses: causes,
      severity,
      recommendations: [
        'Check dashboard warning lights and scan OBD codes.',
        'Do not continue driving if the engine overheats, brakes fail, or oil pressure warning is active.',
        'Book a professional diagnostic inspection before replacing expensive parts.'
      ],
      nextActions: [
        'Record when the symptom appears: cold start, acceleration, braking, or idle.',
        'Add mileage and recent service history.',
        'Visit a trusted workshop if severity is medium or high.'
      ],
      disclaimer: 'AI mechanic is not a replacement for professional diagnostics.'
    };
  }
}
