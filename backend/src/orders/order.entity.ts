import { UserEntity } from '../users/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

const moneyTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  COD = 'COD',
  SSLCOMMERZ = 'SSLCOMMERZ',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 40 })
  orderNumber: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { eager: true, onDelete: 'RESTRICT' })
  user: UserEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true, eager: true })
  items: OrderItemEntity[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
  total: number;

  @Column({ length: 100 })
  customerName: string;

  @Column({ length: 150 })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 80 })
  city: string;

  @Column({ length: 10 })
  postcode: string;

  @Column({ nullable: true, type: 'text' })
  note: string | null;

  @Column({ nullable: true, unique: true, length: 40 })
  transactionId: string | null;

  @Column({ nullable: true, type: 'simple-json' })
  gatewayData: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
