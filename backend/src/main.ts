import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import session = require('express-session');
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const frontend = config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  const secureCookie = config.get<string>('COOKIE_SECURE') === 'true';

  app.set('trust proxy', 1);
  app.enableCors({ origin: frontend, credentials: true });
  app.use(session({
    secret: config.get<string>('SESSION_SECRET') || 'dev-only-change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: secureCookie,
      sameSite: secureCookie ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const port = Number(config.get<string>('PORT') || 4000);
  await app.listen(port);
  console.log(`NexaBazar API running at http://localhost:${port}`);
}
bootstrap();
