import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('wishlist_items')
@Unique(['user', 'product'])
export class WishlistItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.wishlistItems, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { eager: true, onDelete: 'CASCADE' })
  product: ProductEntity;
}
