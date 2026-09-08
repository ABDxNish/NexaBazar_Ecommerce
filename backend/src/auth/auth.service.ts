import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import {
  randomInt,
} from 'crypto';

import {
  DataSource,
} from 'typeorm';

import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger =
    new Logger(AuthService.name);

  private readonly OTP_EXPIRY_MINUTES =
    10;

  constructor(
    private readonly usersService:
      UsersService,

    private readonly mailService:
      MailService,

    private readonly dataSource:
      DataSource,
  ) {}

  /*
   * Generate cryptographically random
   * 6-digit verification code.
   */
  private generateOtp() {
    return randomInt(
      100000,
      1000000,
    ).toString();
  }

  private otpExpiryDate() {
    return new Date(
      Date.now() +
        this.OTP_EXPIRY_MINUTES *
          60 *
          1000,
    );
  }

  private normalizeEmail(
    email: string,
  ) {
    return email
      .trim()
      .toLowerCase();
  }

  /*
   * =============================
   * REGISTER
   * =============================
   */

  async register(
    dto: RegisterDto,
  ) {
    if (
      dto.password !==
      dto.confirmPassword
    ) {
      throw new BadRequestException(
        'Passwords do not match',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        12,
      );

    /*
     * Keep the existing UsersService
     * creation flow intact.
     */
    const user =
      await this.usersService.createLocal(
        {
          fullName:
            dto.fullName.trim(),

          email:
            this.normalizeEmail(
              dto.email,
            ),

          phone:
            dto.phone.trim(),

          password:
            hashedPassword,
        },
      );

    /*
     * Generate email verification OTP.
     */
    const otp =
      this.generateOtp();

    const otpHash =
      await bcrypt.hash(
        otp,
        10,
      );

    const expiresAt =
      this.otpExpiryDate();

    /*
     * Existing accounts use the DB
     * default true.
     *
     * New LOCAL registrations are
     * explicitly marked unverified.
     */
    await this.dataSource
      .getRepository(UserEntity)
      .update(
        user.id,
        {
          emailVerified:
            false,

          emailVerificationOtpHash:
            otpHash,

          emailVerificationOtpExpiresAt:
            expiresAt,
        },
      );

    /*
     * Do not send Welcome yet.
     * Welcome is sent only AFTER
     * successful verification.
     */
    let emailSent = true;

    try {
      await this.mailService
        .sendVerificationOtp(
          user.email,
          user.fullName,
          otp,
        );
    } catch (error) {
      emailSent = false;

      this.logger.error(
        `Could not send verification OTP to ${user.email}`,
        error instanceof Error
          ? error.stack
          : String(error),
      );
    }

    return {
      email:
        user.email,

      requiresVerification:
        true,

      emailSent,
    };
  }

  /*
   * =============================
   * VERIFY EMAIL
   * =============================
   */

  async verifyEmail(
    dto: VerifyEmailDto,
  ) {
    const email =
      this.normalizeEmail(
        dto.email,
      );

    /*
     * emailVerificationOtpHash has
     * select:false, therefore we
     * explicitly select it here.
     */
    const user =
      await this.dataSource
        .getRepository(UserEntity)
        .createQueryBuilder(
          'user',
        )
        .addSelect(
          'user.emailVerificationOtpHash',
        )
        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email,
          },
        )
        .getOne();

    if (!user) {
      throw new BadRequestException(
        'Invalid email or verification code',
      );
    }

    if (user.emailVerified) {
      return {
        message:
          'Email is already verified',
      };
    }

    if (
      !user.emailVerificationOtpHash ||
      !user.emailVerificationOtpExpiresAt
    ) {
      throw new BadRequestException(
        'No active verification code. Please request a new code.',
      );
    }

    /*
     * Check expiry BEFORE bcrypt compare.
     */
    if (
      user
        .emailVerificationOtpExpiresAt
        .getTime() <
      Date.now()
    ) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new code.',
      );
    }

    const otpMatches =
      await bcrypt.compare(
        dto.otp,
        user.emailVerificationOtpHash,
      );

    if (!otpMatches) {
      throw new BadRequestException(
        'Invalid verification code',
      );
    }

    /*
     * Verification complete.
     *
     * Clear OTP data immediately so the
     * same OTP cannot be reused.
     */
    await this.dataSource
      .getRepository(UserEntity)
      .update(
        user.id,
        {
          emailVerified:
            true,

          emailVerificationOtpHash:
            null,

          emailVerificationOtpExpiresAt:
            null,
        },
      );

    /*
     * Verification should remain
     * successful even if the optional
     * welcome email temporarily fails.
     */
    try {
      await this.mailService
        .sendWelcome(
          user.email,
          user.fullName,
        );
    } catch (error) {
      this.logger.warn(
        `Email verified but welcome email failed for ${user.email}`,
      );
    }

    return {
      message:
        'Email verified successfully',
    };
  }

  /*
   * =============================
   * RESEND OTP
   * =============================
   */

  async resendVerification(
    dto: ResendVerificationDto,
  ) {
    const email =
      this.normalizeEmail(
        dto.email,
      );

    const repository =
      this.dataSource.getRepository(
        UserEntity,
      );

    const user =
      await repository
        .createQueryBuilder(
          'user',
        )
        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email,
          },
        )
        .getOne();

    if (!user) {
      throw new BadRequestException(
        'No account was found with this email address',
      );
    }

    if (user.emailVerified) {
      throw new BadRequestException(
        'This email is already verified',
      );
    }

    const otp =
      this.generateOtp();

    const otpHash =
      await bcrypt.hash(
        otp,
        10,
      );

    const expiresAt =
      this.otpExpiryDate();

    /*
     * New OTP automatically replaces
     * the previous OTP.
     */
    await repository.update(
      user.id,
      {
        emailVerificationOtpHash:
          otpHash,

        emailVerificationOtpExpiresAt:
          expiresAt,
      },
    );

    try {
      await this.mailService
        .sendVerificationOtp(
          user.email,
          user.fullName,
          otp,
        );
    } catch (error) {
      this.logger.error(
        `Could not resend verification OTP to ${user.email}`,
      );

      throw new ServiceUnavailableException(
        'Verification email could not be sent. Please try again.',
      );
    }

    return {
      message:
        'A new verification code has been sent',
    };
  }

  /*
   * =============================
   * LOGIN
   * =============================
   */

  async login(
    dto: LoginDto,
  ) {
    const user =
      await this.usersService
        .findByIdentifierWithPassword(
          dto.identifier,
        );

    if (
      !user ||
      !user.password
    ) {
      throw new UnauthorizedException(
        'Invalid email/phone or password',
      );
    }

    const match =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!match) {
      throw new UnauthorizedException(
        'Invalid email/phone or password',
      );
    }

    /*
     * Existing users/admin remain verified
     * because emailVerified defaults true.
     *
     * Newly registered local users are false
     * until OTP verification succeeds.
     */
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    return user;
  }
}