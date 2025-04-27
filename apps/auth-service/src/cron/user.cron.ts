import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserProducer } from '../producers/user.producer';

@Injectable()
export class UserCleanupCron {
  private readonly logger = new Logger(UserCleanupCron.name);

  constructor(private readonly userProducer: UserProducer) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleInactiveUserCleanup() {
    this.logger.log('Scheduling inactive user cleanup job');

    await this.userProducer.scheduleUserCleanup({
      olderThanDays: 90, // Clean up users inactive for more than 90 days
    });

    this.logger.log('Inactive user cleanup job scheduled');
  }
}
