import { Module } from '@nestjs/common';
import { OrderServiceController } from './order-service.controller';
import { OrderService } from './order-service.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DatabaseModule } from '@app/common/database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NATS_URI: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
      }),
      envFilePath: './apps/order-service/.env',
    }),
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URI],
        },
      },
    ]),
    DatabaseModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
  ],
  controllers: [OrderServiceController],
  providers: [OrderService, OrderServiceController],
})
export class OrderServiceModule {}
