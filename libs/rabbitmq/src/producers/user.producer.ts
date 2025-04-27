import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BaseProducer } from './base.producer';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import { UserCreatedEvent, UserUpdatedEvent } from '../interfaces';
import { WorkerService } from '../rabbitmq.worker-service';
import { RabbitMQService } from '../rabbitmq.service';

@Injectable()
export class UserProducer extends BaseProducer {
  private readonly logger = new Logger(UserProducer.name);
  constructor(
    @Inject('RABBITMQ_CLIENT') client: ClientProxy,
    private readonly rabbitMQService: RabbitMQService,
    private readonly workerService: WorkerService,
  ) {
    super(client, SERVICE_NAMES.AUTH_SERVICE);
  }

  async emitUserCreated(data: UserCreatedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.USER_CREATED, data);
  }

  async emitUserUpdated(data: UserUpdatedEvent): Promise<void> {
    await this.emit(RABBITMQ.ROUTING_KEYS.USER_UPDATED, data);
  }

  async scheduleBackgroundTask(
    taskType: string,
    data: any,
    options: { delay?: number } = {},
  ): Promise<void> {
    const payload = {
      taskType,
      data,
      createdAt: new Date().toISOString(),
    };

    await this.workerService.scheduleJob(
      RABBITMQ.EXCHANGES.USER_EVENTS,
      RABBITMQ.ROUTING_KEYS.BACKGROUND_JOB,
      payload,
      options
    );

    this.logger.log(`Scheduled background task: ${taskType}`);
  }

  async scheduleBulkEmails(
    users: User[], //TODO: assign a proper type
    emailTemplate: string,
    data: any,
  ): Promise<void> {
    // Example of scheduling a long-running task
    await this.scheduleBackgroundTask('BULK_EMAIL', {
      userIds: users.map(user => user.id),
      emailTemplate,
      data,
    });
    
    this.logger.log(`Scheduled bulk email task for ${users.length} users`);
  }
}
