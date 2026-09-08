import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  health() {
    return { name: 'NexaBazar API', status: 'ok', time: new Date().toISOString() };
  }
}
