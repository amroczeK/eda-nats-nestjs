import { Controller, Logger } from '@nestjs/common';
import { OrderService } from './order-service.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';

@Controller()
export class OrderServiceController {
  private readonly logger = new Logger(OrderServiceController.name);

  constructor(private readonly orderService: OrderService) {}

  @EventPattern('shop.order.placed')
  async handleOrderPlacedEvent(
    @Payload() orderData: CreateOrderDto,
  ): Promise<void> {
    await this.orderService.createOrder(orderData);
  }
}
