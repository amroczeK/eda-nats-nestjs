import { NestFactory } from '@nestjs/core';
import { OrderServiceModule } from './order-service.module';
import { NatsOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice(OrderServiceModule);
  const app = await NestFactory.createMicroservice<NatsOptions>(
    OrderServiceModule,
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
