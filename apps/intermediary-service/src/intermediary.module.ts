import { Module } from '@nestjs/common';
import { IntermediaryController } from './intermediary.controller';
import { IntermediaryService } from './intermediary.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NATS_URI: Joi.string().required(),
      }),
      envFilePath: './apps/intermediary-service/.env',
    }),
    ClientsModule.register([
      {
        name: 'INTERMEDIARY_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URI],
        },
      },
    ]),
  ],
  controllers: [IntermediaryController],
  providers: [IntermediaryService],
})
export class IntermediaryModule {}
