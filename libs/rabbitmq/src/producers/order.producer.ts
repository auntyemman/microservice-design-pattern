import { Injectable } from '@nestjs/common';
import { BaseProducer } from '../abstracts/base.producer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderConfirmedEvent,
} from '../interfaces';
import { RabbitMQService } from '../rabbitmq.service';

@Injectable()
export class OrderProducer extends BaseProducer {
  constructor(private readonly rabbitMQservice: RabbitMQService) {
    super(rabbitMQservice, SERVICE_NAMES.ORDER_SERVICE);
  }

  async emitOrderCreated(data: OrderCreatedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.ORDER_CREATED, data);
  }

  async emitOrderUpdated(data: OrderUpdatedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.ORDER_UPDATED, data);
  }

  async emitOrderConfirmed(data: OrderConfirmedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.ORDER_CONFIRMED, data);
  }
}
