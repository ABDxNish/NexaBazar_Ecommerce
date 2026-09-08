import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from './cart-item.entity';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CartItemEntity, ProductEntity, UserEntity])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
