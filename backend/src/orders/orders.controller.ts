import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Session, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { OrdersService } from './orders.service';
import { CheckoutDto, UpdateOrderStatusDto } from './dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('checkout')
  @UseGuards(SessionGuard)
  checkout(@Session() session: any, @Body() dto: CheckoutDto) {
    return this.service.checkout(session.userId, dto);
  }

  @Get('my')
  @UseGuards(SessionGuard)
  mine(@Session() session: any) {
    return this.service.findMine(session.userId);
  }

  @Get('admin/stats')
  @UseGuards(AdminGuard)
  stats() {
    return this.service.stats();
  }

  @Get('admin/all')
  @UseGuards(AdminGuard)
  all() {
    return this.service.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  one(@Param('id', ParseIntPipe) id: number, @Session() session: any) {
    return this.service.findOneForUser(id, session.userId, session.role);
  }
}
