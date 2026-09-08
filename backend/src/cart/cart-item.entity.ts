import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('cart_items')
@Unique(['user', 'product'])
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.cartItems, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { eager: true, onDelete: 'CASCADE' })
  product: ProductEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
