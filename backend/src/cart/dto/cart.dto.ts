import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class AddCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class UpdateCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}
