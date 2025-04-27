import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseProducer } from './base.producer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderConfirmedEvent,
} from '../interfaces/events.interface';

@Injectable()
export class OrderProducer extends BaseProducer {
  constructor(@Inject('RABBITMQ_CLIENT') client: ClientProxy) {
    super(client, SERVICE_NAMES.ORDER_SERVICE);
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
