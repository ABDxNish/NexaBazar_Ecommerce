import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

const moneyTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  order: OrderEntity;

  @Column()
  productId: number;

  @Column({ length: 140 })
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
  unitPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  image: string | null;
}
