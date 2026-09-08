import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Session, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../common/guards/session.guard';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
@UseGuards(SessionGuard)
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @Get()
  list(@Session() session: any) {
    return this.service.findForUser(session.userId);
  }

  @Post()
  add(@Session() session: any, @Body('productId', ParseIntPipe) productId: number) {
    return this.service.add(session.userId, productId);
  }

  @Delete(':productId')
  remove(@Session() session: any, @Param('productId', ParseIntPipe) productId: number) {
    return this.service.remove(session.userId, productId);
  }
}
