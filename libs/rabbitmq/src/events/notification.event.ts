import { EmailNotificationEvent, SmsNotificationEvent } from '../interfaces';

export class SendEmailNotification {
  constructor(public readonly data: EmailNotificationEvent) {}
}

export class SendSmsNotification {
  constructor(public readonly data: SmsNotificationEvent) {}
}
