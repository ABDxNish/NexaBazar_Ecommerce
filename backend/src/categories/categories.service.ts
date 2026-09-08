import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ProductEntity } from '../products/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
  ) {}

  findAll() {
    return this.categories.find({ order: { name: 'ASC' } });
  }

  async findById(id: number) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categories.findOne({ where: [{ name: dto.name.trim() }, { slug: dto.slug }] });
    if (existing) throw new ConflictException('Category name or slug already exists');
    return this.categories.save(this.categories.create({ ...dto, name: dto.name.trim() }));
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findById(id);
    const nextName = dto.name?.trim() ?? category.name;
    const nextSlug = dto.slug ?? category.slug;

    const duplicate = await this.categories
      .createQueryBuilder('category')
      .where('(LOWER(category.name) = LOWER(:name) OR category.slug = :slug)', { name: nextName, slug: nextSlug })
      .andWhere('category.id != :id', { id })
      .getOne();
    if (duplicate) throw new ConflictException('Category name or slug already exists');

    category.name = nextName;
    category.slug = nextSlug;
    if (dto.image !== undefined) category.image = dto.image;
    return this.categories.save(category);
  }

  async remove(id: number) {
    const category = await this.findById(id);
    const productCount = await this.products.count({ where: { category: { id } } });
    if (productCount > 0) throw new ConflictException('Move or delete the products in this category first');
    await this.categories.remove(category);
    return { message: 'Category deleted' };
  }
}
