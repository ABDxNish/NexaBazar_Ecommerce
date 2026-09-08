import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { CategoryEntity } from '../categories/category.entity';
import { ProductEntity } from '../products/product.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CategoryEntity, ProductEntity])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
