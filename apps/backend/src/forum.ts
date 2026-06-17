import {Body, Controller, Get, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {IsString, MinLength} from 'class-validator';

const topics = [
  {
    id: 'skoda-karoq-oil-pan',
    brand: 'Skoda',
    model: 'Karoq',
    title: 'Oil leak from oil pan',
    replies: 12,
    votes: 34
  },
  {
    id: 'vw-golf-7-dsg',
    brand: 'Volkswagen',
    model: 'Golf 7',
    title: 'DSG gearbox issues at low speed',
    replies: 28,
    votes: 51
  },
  {
    id: 'bmw-f30-timing-chain',
    brand: 'BMW',
    model: 'F30',
    title: 'Timing chain noise on cold start',
    replies: 19,
    votes: 43
  },
  {
    id: 'renault-megane-egr',
    brand: 'Renault',
    model: 'Megane',
    title: 'EGR clogged and black smoke under acceleration',
    replies: 16,
    votes: 39
  },
  {
    id: 'toyota-corolla-hybrid-battery',
    brand: 'Toyota',
    model: 'Corolla Hybrid',
    title: '12V battery weak, hybrid warning appears randomly',
    replies: 22,
    votes: 46
  }
];

class ForumTopicDto {
  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsString()
  @MinLength(6)
  title!: string;
}

@ApiTags('forum')
@Controller('forum')
export class ForumController {
  @Get('topics')
  list() {
    return topics;
  }

  @Post('topics')
  create(@Body() dto: ForumTopicDto) {
    const topic = {
      id: `${dto.brand}-${dto.model}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
      brand: dto.brand,
      model: dto.model,
      title: dto.title,
      replies: 0,
      votes: 1
    };
    topics.unshift(topic);
    return topic;
  }
}
