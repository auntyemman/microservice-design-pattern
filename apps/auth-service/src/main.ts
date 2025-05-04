import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth-service.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GRPC } from '@app/shared';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  // Apply global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Setup gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: GRPC.AUTH_PACKAGE,
      protoPath: join(__dirname, '../../../libs/grpc/src/protos/auth.proto'),
      url: process.env.AUTH_GRPC_URL || '0.0.0.0:50051',
    },
  });

  // Setup RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Start microservices
  await app.startAllMicroservices();

  // Start HTTP server for health checks and direct API access
  await app.listen(process.env.AUTH_HTTP_PORT || 3001);
  console.log(`Auth service is running on: ${await app.getUrl()}`);
}
bootstrap();
