import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService, private readonly config: ConfigService) {}

  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.service.list(query);
  }

  @Get('featured')
  featured() {
    return this.service.findFeatured();
  }

  @Get('sale')
  sale() {
    return this.service.findSale();
  }

  @Post('upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('files', 6, {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      cb(allowed.includes(file.mimetype) ? null : new Error('Only JPG, PNG, WEBP and GIF files are allowed'), allowed.includes(file.mimetype));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    const base = this.config.get<string>('BACKEND_URL') || 'http://localhost:4000';
    return { urls: files.map((file) => `${base}/uploads/products/${file.filename}`) };
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
