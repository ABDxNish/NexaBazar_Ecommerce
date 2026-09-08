import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { OrderStatus, PaymentMethod } from '../order.entity';

export class CheckoutDto {
  @IsString() @MinLength(3) @MaxLength(100)
  @Matches(/^[A-Za-z .'-]+$/, { message: 'Customer name contains invalid characters' })
  customerName: string;

  @IsEmail() @MaxLength(150)
  email: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, { message: 'Enter a valid Bangladeshi phone number' })
  phone: string;

  @IsString() @MinLength(8) @MaxLength(255)
  address: string;

  @IsString() @MinLength(2) @MaxLength(80)
  city: string;

  @Matches(/^\d{4}$/, { message: 'Postcode must be 4 digits' })
  postcode: string;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
