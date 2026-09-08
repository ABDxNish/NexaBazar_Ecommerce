import {
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';

export class VerifyEmailDto {
  @IsEmail(
    {},
    {
      message:
        'Enter a valid email address',
    },
  )
  @MaxLength(150)
  email: string;

  @Matches(/^\d{6}$/, {
    message:
      'Verification code must be 6 digits',
  })
  otp: string;
}