import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(140)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers and hyphens' })
  slug: string;

  @IsString()
  @MinLength(10)
  @MaxLength(220)
  shortDescription: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(90)
  discountPercent: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  stock: number;

  @Type(() => Boolean)
  @IsBoolean()
  featured: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  images: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(140) name?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) @MaxLength(160) slug?: string;
  @IsOptional() @IsString() @MinLength(10) @MaxLength(220) shortDescription?: string;
  @IsOptional() @IsString() @MinLength(20) @MaxLength(5000) description?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) price?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(90) discountPercent?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() featured?: boolean;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(6) @IsString({ each: true }) images?: string[];
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoryId?: number;
}

export class ProductQueryDto {
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @IsString() @MaxLength(100) category?: string;
  @IsOptional() @IsString() sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number = 12;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
}
