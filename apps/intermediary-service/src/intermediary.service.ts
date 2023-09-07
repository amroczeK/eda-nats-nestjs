import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from 'apps/order-service/src/dtos/create-order.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class IntermediaryService {
  private readonly logger = new Logger(IntermediaryService.name);

  constructor(@Inject('INTERMEDIARY_SERVICE') private client: ClientProxy) {}

  CreateOrder(orderData: CreateOrderDto): string {
    try {
      const msg = 'Order successfully published.';
      this.client.emit('shop.order.placed', orderData);
      this.logger.log(msg);
      return msg;
    } catch (error) {
      this.logger.error(`Failed to publish order`);
      throw new Error(`Failed to publish order: ${error.message}`);
    }
  }

  async ListInventory(): Promise<any> {
    try {
      return await lastValueFrom(
        this.client.send<any>({ cmd: 'shop.inventory.list' }, {}),
      );
    } catch (error) {
      this.logger.error(`Failed to publish order`);
      throw new Error(`Failed to publish order: ${error.message}`);
    }
  }
}
