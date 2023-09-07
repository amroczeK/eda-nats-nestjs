import { NestFactory } from '@nestjs/core';
import { LoggingServiceModule } from './logging-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(LoggingServiceModule);
  await app.listen();
}
bootstrap();
