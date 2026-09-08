import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from '../categories/category.entity';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
  ) {}

  async list(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const qb = this.products.createQueryBuilder('product').leftJoinAndSelect('product.category', 'category');

    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      throw new BadRequestException('Minimum price cannot be greater than maximum price');
    }

    if (query.search) {
      qb.andWhere('(LOWER(product.name) LIKE LOWER(:q) OR LOWER(product.shortDescription) LIKE LOWER(:q))', {
        q: `%${query.search.trim()}%`,
      });
    }
    if (query.category) qb.andWhere('category.slug = :category', { category: query.category });
    if (query.minPrice !== undefined) qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined) qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });

    switch (query.sort) {
      case 'price-asc': qb.orderBy('product.price', 'ASC'); break;
      case 'price-desc': qb.orderBy('product.price', 'DESC'); break;
      case 'rating': qb.orderBy('product.rating', 'DESC'); break;
      default: qb.orderBy('product.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  findFeatured() {
    return this.products.find({ where: { featured: true }, take: 12, order: { createdAt: 'DESC' } });
  }

  findSale() {
    return this.products.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.discountPercent > 0')
      .orderBy('product.discountPercent', 'DESC')
      .take(12)
      .getMany();
  }

  async findBySlug(slug: string) {
    const product = await this.products.findOne({ where: { slug } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: number) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const exists = await this.products.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Product slug already exists');
    const category = await this.categories.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const { categoryId, ...data } = dto;
    return this.products.save(this.products.create({ ...data, category }));
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findById(id);
    if (dto.slug && dto.slug !== product.slug) {
      const exists = await this.products.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('Product slug already exists');
    }
    if (dto.categoryId) {
      const category = await this.categories.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      product.category = category;
    }
    const { categoryId, ...data } = dto;
    Object.assign(product, data);
    return this.products.save(product);
  }

  async remove(id: number) {
    const product = await this.findById(id);
    await this.products.remove(product);
    return { message: 'Product deleted' };
  }
}
