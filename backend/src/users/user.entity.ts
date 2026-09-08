import { CartItemEntity } from '../cart/cart-item.entity';
import { OrderEntity } from '../orders/order.entity';
import { WishlistItemEntity } from '../wishlist/wishlist-item.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({
    unique: true,
    length: 150,
  })
  email: string;

  @Column({
    unique: true,
    nullable: true,
    length: 20,
  })
  phone: string | null;

  @Column({
    select: false,
    nullable: true,
  })
  password: string | null;

  @Column({
    unique: true,
    nullable: true,
    length: 100,
  })
  googleId: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  /*
   * Existing users remain verified.
   *
   * New LOCAL registrations are explicitly
   * changed to false inside AuthService.
   *
   * This also avoids breaking the seeded admin
   * and existing Google users.
   */
  @Column({
    default: true,
  })
  emailVerified: boolean;

  /*
   * Never store the 6-digit OTP itself.
   * Only its bcrypt hash is saved.
   *
   * select:false prevents this field from
   * normally being returned with UserEntity.
   */
  @Column({
    nullable: true,
    select: false,
    length: 255,
  })
  emailVerificationOtpHash:
    | string
    | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  emailVerificationOtpExpiresAt:
    | Date
    | null;

  @Column({
    nullable: true,
  })
  photo: string | null;

  @Column({
    nullable: true,
    length: 255,
  })
  address: string | null;

  @Column({
    nullable: true,
    length: 80,
  })
  city: string | null;

  @Column({
    nullable: true,
    length: 10,
  })
  postcode: string | null;

  @OneToMany(
    () => CartItemEntity,
    (item) => item.user,
  )
  cartItems: CartItemEntity[];

  @OneToMany(
    () => WishlistItemEntity,
    (item) => item.user,
  )
  wishlistItems: WishlistItemEntity[];

  @OneToMany(
    () => OrderEntity,
    (order) => order.user,
  )
  orders: OrderEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}