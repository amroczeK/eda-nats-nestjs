import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto, OrderItemDto } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject('ORDER_SERVICE') private client: ClientProxy,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(orderData: CreateOrderDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const stockAvailable = await this.validateStockAvailableInInventory(
        orderData,
      );
      if (!stockAvailable) throw 'Order has items with unavailable stock.';
      this.logger.log(
        `Stock available for all items in order: ${JSON.stringify(orderData)}`,
      );

      const order = new Order();
      order.customer_name = orderData.customer_name;
      order.customer_email = orderData.customer_email;
      order.total_items = calculateTotalOrderedItems(orderData.order_items);
      order.total_value = calculateTotalOrderValue(orderData.order_items);
      const orderItems: OrderItem[] = orderData.order_items.map(
        (itemData: OrderItemDto) => {
          const orderItem = new OrderItem();
          orderItem.product_name = itemData.product_name;
          orderItem.quantity = itemData.quantity;
          orderItem.price = itemData.price;
          return orderItem;
        },
      );
      const savedOrderItems = await queryRunner.manager.save(orderItems);
      this.logger.log(`Saved order items: ${JSON.stringify(savedOrderItems)}`);

      // Associate the saved OrderItem entities with the Order entity
      order.order_items = savedOrderItems;

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      this.logger.log(`Order created: ${JSON.stringify(order)}.`);

      this.client.emit(
        'shop.inventory.decrement.quantity',
        orderData.order_items,
      );
    } catch (error) {
      this.logger.error(`Error creating order: ${error}`);
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  private async validateStockAvailableInInventory(
    orderData: CreateOrderDto,
  ): Promise<boolean> {
    try {
      return await firstValueFrom(
        this.client.send<boolean>(
          { cmd: 'shop.inventory.check' },
          orderData.order_items,
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(): Promise<void> {
    // DO STUFF
  }

  async orderFailed(): Promise<void> {
    // DO STUFF
  }
}

function calculateTotalOrderValue(orderItems: OrderItemDto[]): number {
  return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function calculateTotalOrderedItems(orderItems: OrderItemDto[]): number {
  return orderItems.reduce((acc, item) => acc + item.quantity, 0);
}
