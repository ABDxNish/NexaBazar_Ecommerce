import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(5)
  @MaxLength(150)
  @Matches(
    /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?88)?01[3-9]\d{8})$/,
    { message: 'Use a valid email address or Bangladeshi phone number' },
  )
  identifier: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
