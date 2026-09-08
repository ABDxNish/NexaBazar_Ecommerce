import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import session = require('express-session');
import connectPgSimple = require('connect-pg-simple');

import { Pool } from 'pg';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  const config =
    app.get(ConfigService);

  const frontend =
    config.get<string>(
      'FRONTEND_URL',
    ) ||
    'http://localhost:3000';

  const secureCookie =
    config.get<string>(
      'COOKIE_SECURE',
    ) === 'true';

  const dbSsl =
    config.get<string>(
      'DB_SSL',
    ) === 'true';

  /*
   * Required behind Render's proxy
   * so secure cookies work correctly.
   */
  app.set(
    'trust proxy',
    1,
  );

  /*
   * Only allow the configured frontend
   * and allow session cookies.
   */
  app.enableCors({
    origin: frontend,
    credentials: true,
  });

  /*
   * PostgreSQL-backed session store.
   *
   * Local:
   * PostgreSQL on localhost
   *
   * Production:
   * Neon PostgreSQL
   */
  const sessionPool =
    new Pool({
      host:
        config.get<string>(
          'DB_HOST',
        ) ||
        'localhost',

      port: Number(
        config.get<string>(
          'DB_PORT',
        ) ||
        5432,
      ),

      user:
        config.get<string>(
          'DB_USERNAME',
        ) ||
        'postgres',

      password:
        config.get<string>(
          'DB_PASSWORD',
        ) ||
        'postgres',

      database:
        config.get<string>(
          'DB_NAME',
        ) ||
        'nexabazar',

      ssl: dbSsl
        ? {
            rejectUnauthorized:
              false,
          }
        : false,
    });

  const PgSession =
    connectPgSimple(
      session,
    );

  app.use(
    session({
      store:
        new PgSession({
          pool:
            sessionPool,

          tableName:
            'user_sessions',

          createTableIfMissing:
            true,
        }),

      secret:
        config.get<string>(
          'SESSION_SECRET',
        ) ||
        'dev-only-change-this-secret',

      resave: false,

      saveUninitialized:
        false,

      cookie: {
        httpOnly:
          true,

        secure:
          secureCookie,

        sameSite:
          secureCookie
            ? 'none'
            : 'lax',

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:
        true,

      forbidNonWhitelisted:
        true,

      transform:
        true,

      transformOptions: {
        enableImplicitConversion:
          true,
      },
    }),
  );

  app.useStaticAssets(
    join(
      process.cwd(),
      'uploads',
    ),
    {
      prefix:
        '/uploads/',
    },
  );

  const port =
    Number(
      config.get<string>(
        'PORT',
      ) ||
        4000,
    );

  /*
   * Render requires the web service
   * to be reachable on the public
   * network interface.
   */
  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `NexaBazar API running on port ${port}`,
  );
}

bootstrap();