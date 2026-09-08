import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItemEntity } from './cart-item.entity';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
import { AddCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItemEntity) private readonly items: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  findForUser(userId: number) {
    return this.items.find({ where: { user: { id: userId } }, order: { id: 'DESC' } });
  }

  async summary(userId: number) {
    const items = await this.findForUser(userId);
    const subtotal = items.reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discountPercent / 100);
      return sum + price * item.quantity;
    }, 0);
    return { items, count: items.reduce((s, i) => s + i.quantity, 0), subtotal: Number(subtotal.toFixed(2)) };
  }

  async add(userId: number, dto: AddCartDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    const product = await this.products.findOne({ where: { id: dto.productId } });
    if (!user) throw new NotFoundException('User not found');
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < 1) throw new BadRequestException('Product is out of stock');

    let item = await this.items.findOne({ where: { user: { id: userId }, product: { id: dto.productId } } });
    const nextQuantity = (item?.quantity || 0) + dto.quantity;
    if (nextQuantity > Math.min(product.stock, 20)) throw new BadRequestException('Requested quantity is not available');

    if (item) item.quantity = nextQuantity;
    else item = this.items.create({ user, product, quantity: dto.quantity });
    return this.items.save(item);
  }

  async update(userId: number, itemId: number, dto: UpdateCartDto) {
    const item = await this.items.findOne({ where: { id: itemId, user: { id: userId } } });
    if (!item) throw new NotFoundException('Cart item not found');
    if (dto.quantity > item.product.stock) throw new BadRequestException('Requested quantity is not available');
    item.quantity = dto.quantity;
    return this.items.save(item);
  }

  async remove(userId: number, itemId: number) {
    const item = await this.items.findOne({ where: { id: itemId, user: { id: userId } } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.items.remove(item);
    return { message: 'Item removed from cart' };
  }

  async clear(userId: number) {
    await this.items.createQueryBuilder().delete().where('"userId" = :userId', { userId }).execute();
  }
}
