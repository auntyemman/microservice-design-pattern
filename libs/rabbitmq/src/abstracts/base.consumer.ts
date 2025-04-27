import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { RabbitMQEvent, EventPayload } from '../interfaces';

@Injectable()
export abstract class BaseConsumer<T extends EventPayload = EventPayload>
  implements OnModuleInit
{
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly rabbitMQService: RabbitMQService,
    protected readonly queueName: string,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume<RabbitMQEvent<T>>(
      this.queueName,
      async (message) => {
        try {
          this.logger.log(`Processing message: ${message.event}`);
          await this.process(message);
          this.logger.log(`Successfully processed message: ${message.event}`);
        } catch (error) {
          this.logger.error(
            `Error processing message: ${error.message}`,
            error.stack,
          );
          throw error; // Let the RabbitMQService handle the error
        }
      },
    );

    this.logger.log(`Consumer registered for queue: ${this.queueName}`);
  }

  /**
   * Process the received message
   */
  abstract process(message: RabbitMQEvent<T>): Promise<void>;
}
