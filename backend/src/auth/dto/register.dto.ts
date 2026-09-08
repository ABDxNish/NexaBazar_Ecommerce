import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(100)
  @Matches(/^[A-Za-z .'-]+$/, { message: 'Full name contains invalid characters' })
  fullName: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(150)
  email: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, { message: 'Enter a valid Bangladeshi phone number' })
  phone: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain a lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain a number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain a special character' })
  password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  confirmPassword: string;
}
