import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Session, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard';
import { CartService } from './cart.service';
import { AddCartDto, UpdateCartDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(SessionGuard)
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  getCart(@Session() session: any) {
    return this.service.summary(session.userId);
  }

  @Post()
  add(@Session() session: any, @Body() dto: AddCartDto) {
    return this.service.add(session.userId, dto);
  }

  @Patch(':id')
  update(@Session() session: any, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCartDto) {
    return this.service.update(session.userId, id, dto);
  }

  @Delete(':id')
  remove(@Session() session: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(session.userId, id);
  }

  @Delete()
  clear(@Session() session: any) {
    return this.service.clear(session.userId);
  }
}
