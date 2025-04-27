import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseProducer } from './base.producer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import { UserCreatedEvent, UserUpdatedEvent } from '../interfaces';

@Injectable()
export class UserProducer extends BaseProducer {
  constructor(@Inject('RABBITMQ_CLIENT') client: ClientProxy) {
    super(client, SERVICE_NAMES.AUTH_SERVICE);
  }

  async emitUserCreated(data: UserCreatedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.USER_CREATED, data);
  }

  async emitUserUpdated(data: UserUpdatedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.USER_UPDATED, data);
  }
}
