import { Injectable, Inject } from '@nestjs/common';
import {
  BaseProducer,
  RabbitMQService,
  UserCreatedEvent,
  UserUpdatedEvent,
} from '@app/rabbitmq';
import { RABBITMQ, SERVICE_NAMES } from '@app/shared/constants';
import { ClientProxy } from '@nestjs/microservices';
import { WorkerService } from '@app/rabbitmq/rabbitmq.worker-service';

@Injectable()
export class UserProducer extends BaseProducer {
  constructor(
    // @Inject('RABBITMQ_CLIENT') client: ClientProxy,
    protected readonly rabbitMQService: RabbitMQService,
    private readonly workerService: WorkerService,
  ) {
    super(rabbitMQService, SERVICE_NAMES.AUTH_SERVICE);
  }

  /**
   * Emit user created event
   */
  async userCreated(user: UserCreatedEvent): Promise<boolean> {
    return this.emit(
      RABBITMQ.EXCHANGES.USER_EVENTS,
      RABBITMQ.ROUTING_KEYS.USER_CREATED,
      user,
    );
  }

  /**
   * Emit user updated event
   */
  async userUpdated(user: UserUpdatedEvent): Promise<boolean> {
    return this.emit(
      RABBITMQ.EXCHANGES.USER_EVENTS,
      RABBITMQ.ROUTING_KEYS.USER_UPDATED,
      user,
    );
  }

  /**
   * Schedule user cleanup job
   * a cron job or a fixed scheduder
   */
  async scheduleUserCleanup(data: { olderThanDays: number }): Promise<boolean> {
    return this.submitJob(
      RABBITMQ.EXCHANGES.USER_EVENTS,
      RABBITMQ.ROUTING_KEYS.BACKGROUND_JOB,
      'user_cleanup',
      data,
      { priority: 5 },
    );
  }

  // An immediate or delayed/fixed time background job
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
      options,
    );
  }

  async scheduleBulkEmails(
    users: User[], //TODO: assign a proper type
    emailTemplate: string,
    data: any,
  ): Promise<void> {
    // Example of scheduling a long-running task immedetitely with no delay.
    await this.scheduleBackgroundTask('BULK_EMAIL', {
      userIds: users.map((user) => user.id),
      emailTemplate,
      data,
    });
  }
}
