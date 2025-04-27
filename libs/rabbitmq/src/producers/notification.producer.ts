import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseProducer } from './base.producer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import { EmailNotificationEvent, SmsNotificationEvent } from '../interfaces';

@Injectable()
export class NotificationProducer extends BaseProducer {
  constructor(@Inject('RABBITMQ_CLIENT') client: ClientProxy) {
    super(client, SERVICE_NAMES.NOTIFICATION_SERVICE);
  }

  async emitSendEmailNotification(data: EmailNotificationEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.NOTIFICATION_EMAIL, data);
  }

  async emitSendSmsNotification(data: SmsNotificationEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.NOTIFICATION_SMS, data);
  }
}
