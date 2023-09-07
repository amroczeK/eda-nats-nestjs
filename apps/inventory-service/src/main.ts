import { NestFactory } from '@nestjs/core';
import { InventoryServiceModule } from './inventory-service.module';
import { NatsOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<NatsOptions>(
    InventoryServiceModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URI],
      },
    },
  );
  await app.listen();
}
bootstrap();
