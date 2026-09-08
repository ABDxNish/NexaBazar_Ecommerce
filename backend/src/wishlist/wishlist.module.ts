import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItemEntity } from './wishlist-item.entity';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItemEntity, ProductEntity, UserEntity])],
  providers: [WishlistService],
  controllers: [WishlistController],
})
export class WishlistModule {}
