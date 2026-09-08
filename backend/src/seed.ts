import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const result = await app.get(SeedService).run();
    console.log(result);
  } finally {
    await app.close();
  }
}
seed();
