import { NestFactory } from '@nestjs/core';
import { AdminDashboardModule } from './admin-dashboard.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminDashboardModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
