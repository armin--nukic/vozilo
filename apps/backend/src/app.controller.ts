import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('system')
@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'vozilo-api'
    };
  }

  @Get('modules')
  modules() {
    return [
      'auth',
      'users',
      'vehicles',
      'maintenance',
      'expenses',
      'reminders',
      'workshops',
      'reviews',
      'forum',
      'ai-assistant',
      'admin'
    ];
  }
}
