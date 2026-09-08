import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    MailModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    GoogleStrategy,
  ],
})
export class AuthModule {}