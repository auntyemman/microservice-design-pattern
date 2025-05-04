import { Injectable } from '@nestjs/common';
import { BaseProducer } from '../abstracts/base.producer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import { EmailNotificationEvent, SmsNotificationEvent } from '../interfaces';
import { RabbitMQService } from '../rabbitmq.service';

@Injectable()
export class NotificationProducer extends BaseProducer {
  constructor(private readonly rabbitMQservice: RabbitMQService) {
    super(rabbitMQservice, SERVICE_NAMES.NOTIFICATION_SERVICE);
  }

  async emitSendEmailNotification(data: EmailNotificationEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.NOTIFICATION_EMAIL, data);
  }

  async emitSendSmsNotification(data: SmsNotificationEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.NOTIFICATION_SMS, data);
  }
}
