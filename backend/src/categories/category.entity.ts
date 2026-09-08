import { ProductEntity } from '../products/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 80 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ nullable: true })
  image: string | null;

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}
