import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseWorker, RabbitMQService } from '@app/rabbitmq';
import { RABBITMQ } from '@app/shared/constants';
import { User } from '../entities/user.entity';

interface UserCleanupPayload {
  olderThanDays: number;
}

@Injectable()
export class UserCleanupWorker extends BaseWorker<UserCleanupPayload> {
  constructor(
    protected readonly rabbitMQService: RabbitMQService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(rabbitMQService, RABBITMQ.QUEUES.BACKGROUND_JOBS, 'user_cleanup');
  }

  async process(payload: UserCleanupPayload): Promise<void> {
    const { olderThanDays } = payload;

    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.logger.log(
      `Cleaning up inactive users older than ${olderThanDays} days (before ${cutoffDate})`,
    );

    // Delete inactive users older than the cutoff date
    const result = await this.userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('last_login_at < :cutoffDate', { cutoffDate })
      .andWhere('status = :status', { status: 'inactive' })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} inactive users`);
  }
}
