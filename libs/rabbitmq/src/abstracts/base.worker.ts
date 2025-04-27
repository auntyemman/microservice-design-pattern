import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { Job } from '../interfaces';

@Injectable()
export abstract class BaseWorker<T = any> implements OnModuleInit {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly rabbitMQService: RabbitMQService,
    protected readonly queueName: string,
    protected readonly jobType: string,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consume<Job<T>>(this.queueName, async (job) => {
      // Only process jobs of the registered type
      if (job.type !== this.jobType) {
        this.logger.log(
          `Ignoring job of type ${job.type}, expected ${this.jobType}`,
        );
        return;
      }

      try {
        this.logger.log(`Processing job: ${job.id}`);
        await this.process(job.payload);
        this.logger.log(`Successfully processed job: ${job.id}`);
      } catch (error) {
        this.logger.error(
          `Error processing job: ${error.message}`,
          error.stack,
        );
        throw error; // Let the RabbitMQService handle the error
      }
    });

    this.logger.log(
      `Worker registered for queue: ${this.queueName}, job type: ${this.jobType}`,
    );
  }

  /**
   * Process the job payload
   */
  abstract process(payload: T): Promise<void>;
}
