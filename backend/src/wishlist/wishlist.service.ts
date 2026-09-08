import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItemEntity } from './wishlist-item.entity';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItemEntity) private readonly items: Repository<WishlistItemEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  findForUser(userId: number) {
    return this.items.find({ where: { user: { id: userId } }, order: { id: 'DESC' } });
  }

  async add(userId: number, productId: number) {
    const existing = await this.items.findOne({ where: { user: { id: userId }, product: { id: productId } } });
    if (existing) throw new ConflictException('Product is already in wishlist');
    const user = await this.users.findOne({ where: { id: userId } });
    const product = await this.products.findOne({ where: { id: productId } });
    if (!user || !product) throw new NotFoundException('User or product not found');
    return this.items.save(this.items.create({ user, product }));
  }

  async remove(userId: number, productId: number) {
    const item = await this.items.findOne({ where: { user: { id: userId }, product: { id: productId } } });
    if (!item) throw new NotFoundException('Wishlist item not found');
    await this.items.remove(item);
    return { message: 'Removed from wishlist' };
  }
}
