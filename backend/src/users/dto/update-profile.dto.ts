import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[A-Za-z .'-]+$/, { message: 'Name contains invalid characters' })
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, { message: 'Use a valid Bangladeshi phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'Postcode must be 4 digits' })
  postcode?: string;
}
