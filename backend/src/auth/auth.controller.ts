import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';

import {
  AuthGuard,
} from '@nestjs/passport';

import {
  Request,
  Response,
} from 'express';

import {
  ConfigService,
} from '@nestjs/config';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

import { SessionGuard } from '../common/guards/session.guard';

import { UsersService } from '../users/users.service';

import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,

    private readonly usersService:
      UsersService,

    private readonly config:
      ConfigService,
  ) {}

  /*
   * ============================
   * REGISTER
   * ============================
   *
   * IMPORTANT:
   * We no longer create a login
   * session here.
   *
   * User must verify email first.
   */
  @Post('register')
  async register(
    @Body()
    dto: RegisterDto,
  ) {
    const result =
      await this.authService.register(
        dto,
      );

    return {
      message:
        result.emailSent
          ? 'Registration successful. Verification code sent to your email.'
          : 'Registration successful, but the verification email could not be sent. Please use resend verification.',

      email:
        result.email,

      requiresVerification:
        true,

      emailSent:
        result.emailSent,
    };
  }

  /*
   * ============================
   * VERIFY EMAIL
   * ============================
   */
  @Post('verify-email')
  verifyEmail(
    @Body()
    dto: VerifyEmailDto,
  ) {
    return this.authService
      .verifyEmail(dto);
  }

  /*
   * ============================
   * RESEND VERIFICATION OTP
   * ============================
   */
  @Post('resend-verification')
  resendVerification(
    @Body()
    dto: ResendVerificationDto,
  ) {
    return this.authService
      .resendVerification(
        dto,
      );
  }

  /*
   * ============================
   * LOGIN
   * ============================
   */
  @Post('login')
  async login(
    @Body()
    dto: LoginDto,

    @Session()
    session: any,
  ) {
    const user =
      await this.authService.login(
        dto,
      );

    session.userId =
      user.id;

    session.role =
      user.role;

    return {
      message:
        'Login successful',

      user:
        this.usersService.sanitize(
          user,
        ),
    };
  }

  /*
   * ============================
   * LOGOUT
   * ============================
   */
  @Post('logout')
  logout(
    @Req()
    req: Request,
  ) {
    return new Promise(
      (
        resolve,
        reject,
      ) => {
        req.session.destroy(
          (error) => {
            if (error) {
              return reject(
                error,
              );
            }

            resolve({
              message:
                'Logged out successfully',
            });
          },
        );
      },
    );
  }

  /*
   * ============================
   * CURRENT USER
   * ============================
   */
  @Get('me')
  @UseGuards(
    SessionGuard,
  )
  async me(
    @Session()
    session: any,
  ) {
    return this.usersService
      .sanitize(
        await this.usersService
          .findById(
            session.userId,
          ),
      );
  }

  /*
   * ============================
   * PROFILE
   * ============================
   */
  @Patch('profile')
  @UseGuards(
    SessionGuard,
  )
  updateProfile(
    @Body()
    dto: UpdateProfileDto,

    @Session()
    session: any,
  ) {
    return this.usersService
      .updateProfile(
        session.userId,
        dto,
      );
  }

  /*
   * ============================
   * GOOGLE LOGIN
   * ============================
   */
  @Get('google')
  @UseGuards(
    AuthGuard('google'),
  )
  googleLogin() {
    return;
  }

  /*
   * Google authenticated the email,
   * so Google login continues exactly
   * as before.
   */
  @Get('google/callback')
  @UseGuards(
    AuthGuard('google'),
  )
  async googleCallback(
    @Req()
    req: any,

    @Res()
    res: Response,
  ) {
    req.session.userId =
      req.user.id;

    req.session.role =
      req.user.role;

    const frontend =
      this.config.get<string>(
        'FRONTEND_URL',
      ) ||
      'http://localhost:3000';

    return res.redirect(
      `${frontend}/account?google=success`,
    );
  }
}