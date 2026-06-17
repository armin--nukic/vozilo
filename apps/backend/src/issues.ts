import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

const commonIssues = [
  {
    id: 'vw-golf-7-dsg-mechatronic',
    make: 'Volkswagen',
    model: 'Golf 7',
    issue: 'DSG mechatronic hesitation',
    symptoms: ['jerking at low speed', 'delayed gear engagement', 'PRNDS warning'],
    severity: 'high',
    estimatedCostKm: {min: 450, max: 1600},
    votes: 128,
    recommendedAction: 'Scan transmission codes and inspect DSG service history.'
  },
  {
    id: 'skoda-karoq-oil-pan',
    make: 'Skoda',
    model: 'Karoq',
    issue: 'Oil pan leak',
    symptoms: ['oil drops under car', 'burning smell', 'low oil warning'],
    severity: 'medium',
    estimatedCostKm: {min: 120, max: 420},
    votes: 64,
    recommendedAction: 'Inspect oil pan gasket and check for impact damage.'
  },
  {
    id: 'bmw-f30-timing-chain',
    make: 'BMW',
    model: 'F30',
    issue: 'Timing chain noise',
    symptoms: ['rattle on cold start', 'rough idle', 'metallic noise'],
    severity: 'high',
    estimatedCostKm: {min: 900, max: 2400},
    votes: 97,
    recommendedAction: 'Do not ignore cold-start rattle; book specialist inspection.'
  },
  {
    id: 'renault-megane-egr',
    make: 'Renault',
    model: 'Megane',
    issue: 'EGR valve clogging',
    symptoms: ['loss of power', 'black smoke', 'check engine light'],
    severity: 'medium',
    estimatedCostKm: {min: 160, max: 650},
    votes: 82,
    recommendedAction: 'Read OBD codes and inspect EGR/intake deposits.'
  },
  {
    id: 'hyundai-i30-clutch',
    make: 'Hyundai',
    model: 'i30',
    issue: 'Clutch wear',
    symptoms: ['slipping under acceleration', 'high biting point', 'burning smell'],
    severity: 'medium',
    estimatedCostKm: {min: 380, max: 950},
    votes: 55,
    recommendedAction: 'Check clutch slip and dual-mass flywheel condition.'
  },
  {
    id: 'toyota-corolla-battery',
    make: 'Toyota',
    model: 'Corolla Hybrid',
    issue: '12V battery weakness',
    symptoms: ['slow startup', 'hybrid system warning', 'random electrical warnings'],
    severity: 'low',
    estimatedCostKm: {min: 120, max: 280},
    votes: 73,
    recommendedAction: 'Test 12V battery health before replacing sensors.'
  }
];

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  @Get('common')
  list(@Query('make') make?: string) {
    if (!make) {
      return commonIssues;
    }

    return commonIssues.filter((issue) => issue.make.toLowerCase() === make.toLowerCase());
  }
}
