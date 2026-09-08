import { CategoryEntity } from '../categories/category.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const moneyTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 140 })
  name: string;

  @Column({ unique: true, length: 160 })
  slug: string;

  @Column({ length: 220 })
  shortDescription: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: moneyTransformer })
  price: number;

  @Column({ type: 'int', default: 0 })
  discountPercent: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'float', default: 4.5 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'simple-json' })
  images: string[];

  @ManyToOne(() => CategoryEntity, (category) => category.products, { eager: true, onDelete: 'RESTRICT' })
  category: CategoryEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
