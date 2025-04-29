import { Injectable, Controller, OnModuleInit } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { RabbitMQService } from '@app/rabbitmq';
import { RABBITMQ } from '@app/shared/constants';
import { UserService } from '../services/user.service';

@Injectable()
@Controller() // Keep this decorator for microservice patterns to work
export class UserConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly userService: UserService,
  ) {}

  // Setup direct consumers when module initializes
  async onModuleInit() {
    await this.setupDirectConsumers();
  }

  // Handler for user events like notification failure with manual acknowledgment
  @EventPattern('notification.failure')
  async handleUserFailedNotification(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      console.log(
        'Notification failure event received via microservice:',
        data,
      );
      // Process message data
      // Implement compensation logic here
      // For example: rollback user changes or trigger another process

      // Manually acknowledge the message after successful processing
      channel.ack(originalMessage);
    } catch (error) {
      console.error('Error processing notification failure event:', error);

      // Reject the message and decide whether to requeue it
      // false = don't requeue (send to dead letter exchange if configured)
      // true = requeue the message for retry
      const requeue = this.shouldRequeueMessage(error);
      channel.reject(originalMessage, requeue);

      // Don't throw the error here if you're manually handling acknowledgment
      // throw error;
    }
  }

  // Handle user update requests via message pattern with manual acknowledgment
  @MessagePattern(RABBITMQ.ROUTING_KEYS.USER_UPDATED)
  async handleUserUpdated(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      console.log('User updated event received via microservice:', data);

      // Process the update
      const result = await this.userService.update(data.id, data);

      // Acknowledge the message after successful processing
      channel.ack(originalMessage);

      // Return the result
      return result;
    } catch (error) {
      console.error('Error processing user updated event:', error);

      // Reject the message with appropriate requeue strategy
      const requeue = this.shouldRequeueMessage(error);
      channel.reject(originalMessage, requeue);

      // You can still throw the error to the caller if needed
      throw error;
    }
  }

  // Helper method to determine if a message should be requeued based on error type
  private shouldRequeueMessage(error: any): boolean {
    // Don't requeue on business logic errors, validation errors, etc.
    if (error.name === 'ValidationError' || error.name === 'BusinessError') {
      return false;
    }

    // Requeue on transient errors (network, temporary database issues, etc.)
    if (
      error.name === 'DatabaseConnectionError' ||
      error.name === 'TimeoutError'
    ) {
      return true;
    }

    // Default behavior - could be based on your error handling strategy
    return false; // Conservative default: don't requeue to avoid infinite loops
  }

  // Setup direct consumers for more control and advanced scenarios
  private async setupDirectConsumers(): Promise<void> {
    // Direct consumer for user created events
    await this.rabbitMQService.consume(
      RABBITMQ.QUEUES.USER_CREATED,
      async (message) => {
        try {
          console.log(
            'User created event received via direct consumer:',
            message,
          );
          // Process the message - e.g., create related records or send welcome emails
          await this.handleUserCreated(message);
        } catch (error) {
          console.error('Error in user created consumer:', error);
          // Implement retry logic or dead letter queue handling here
        }
      },
    );

    // Consumer for background jobs related to users
    await this.rabbitMQService.consume(
      RABBITMQ.QUEUES.BACKGROUND_JOBS,
      async (job) => {
        try {
          if (job.type && job.type.startsWith('user.')) {
            console.log(`Processing user job: ${job.type}`, job);
            await this.processUserJob(job);
          }
        } catch (error) {
          console.error(`Error processing job ${job?.type}:`, error);
          // Handle job processing errors
        }
      },
    );
  }

  // Helper method for processing user created events
  private async handleUserCreated(userData: any): Promise<void> {
    // Implement user creation side effects
    // e.g., create user profiles, send welcome emails, etc.
  }

  // Helper method for processing background jobs
  private async processUserJob(job: any): Promise<void> {
    switch (job.type) {
      case 'user.process-data':
        // Process user data
        break;
      case 'user.cleanup':
        // Clean up user data
        break;
      default:
        console.log(`Unknown job type: ${job.type}`);
    }
  }
}
