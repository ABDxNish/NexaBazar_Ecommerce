import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
} from 'passport-google-oauth20';

import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID:
        config.get<string>(
          'GOOGLE_CLIENT_ID',
        ) ||
        'disabled-google-client-id',

      clientSecret:
        config.get<string>(
          'GOOGLE_CLIENT_SECRET',
        ) ||
        'disabled-google-client-secret',

      callbackURL:
        config.get<string>(
          'GOOGLE_CALLBACK_URL',
        ) ||
        'http://localhost:4000/auth/google/callback',

      scope: [
        'email',
        'profile',
      ],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const rawEmail =
      profile.emails?.[0]?.value;

    if (!rawEmail) {
      throw new Error(
        'Google account did not provide an email address',
      );
    }

    const email =
      rawEmail
        .trim()
        .toLowerCase();

    return this.usersService
      .findOrCreateGoogle({
        googleId:
          profile.id,

        email,

        fullName:
          profile.displayName?.trim() ||
          email.split('@')[0],

        photo:
          profile.photos?.[0]?.value,
      });
  }
}