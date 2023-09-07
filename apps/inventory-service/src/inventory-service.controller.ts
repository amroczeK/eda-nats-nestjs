import { Controller, Logger } from '@nestjs/common';
import { InventoryService } from './inventory-service.service';
import { Inventory } from './entities/inventory.entity';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class InventoryServiceController {
  private readonly logger = new Logger(InventoryServiceController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern('shop.inventory.>')
  async handleInventory(
    @Payload()
    inventoryData: any,
    @Ctx() context: NatsContext,
  ): Promise<void> {
    const subject = context.getSubject();
    switch (subject) {
      case 'shop.inventory.create': {
        // TODO: Validate payload
        this.inventoryService.createInventory(inventoryData);
        break;
      }
      case 'shop.inventory.list': {
        // TODO: Validate payload
        this.inventoryService.listInventory();
        break;
      }
      case 'shop.inventory.update': {
        // TODO: Validate payload
        this.inventoryService.updateInventory(inventoryData);
        break;
      }
      case 'shop.inventory.delete': {
        // TODO: Validate payload
        this.inventoryService.removeFromInventory(inventoryData);
        break;
      }
      case 'shop.inventory.decrement.quantity': {
        // TODO: Validate payload
        this.inventoryService.decrementQuantity(inventoryData);
        break;
      }
      default: {
        this.logger.log(`There is no handler for message subject: ${subject}`);
        break;
      }
    }
  }

  @MessagePattern({ cmd: 'shop.inventory.list' })
  async handleListInventory(): Promise<Inventory[]> {
    return this.inventoryService.listInventory();
  }

  @MessagePattern({ cmd: 'shop.inventory.check' })
  async handleCheckInventory(
    @Payload() inventoryData: Inventory[],
  ): Promise<boolean> {
    return this.inventoryService.checkInventory(inventoryData);
  }
}
