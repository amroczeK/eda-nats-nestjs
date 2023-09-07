import { Module } from '@nestjs/common';
import { LoggingServiceController } from './logging-service.controller';
import { LoggingService } from './logging-service.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from './entities/event-log.entity';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
      envFilePath: './apps/logging-service/.env',
    }),
    ClientsModule.register([
      {
        name: 'LOGGING_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URI],
        },
      },
    ]),
    DatabaseModule,
    TypeOrmModule.forFeature([EventLog]),
  ],
  controllers: [LoggingServiceController],
  providers: [LoggingService],
})
export class LoggingServiceModule {}
