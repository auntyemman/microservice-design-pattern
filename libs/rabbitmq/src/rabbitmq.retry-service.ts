import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  retryRoutingKey?: string;
  retryExchange?: string;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  /**
   * Execute a task with application layer manual retry capability
   */
  async executeWithRetry<T, R>(
    taskFn: (data: T) => Promise<R>,
    data: T,
    options: RetryOptions = {},
  ): Promise<R> {
    const {
      maxRetries = 3,
      initialDelayMs = 1000,
      backoffFactor = 2,
    } = options;

    let attempt = 0;
    let lastError: any;

    while (attempt <= maxRetries) {
      try {
        return await taskFn(data);
      } catch (error) {
        lastError = error;
        attempt++;

        if (attempt > maxRetries) {
          break;
        }

        const delay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
        this.logger.warn(
          `Retry attempt ${attempt}/${maxRetries} after ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.logger.error(
      `Failed after ${maxRetries} retries`,
      lastError?.stack || lastError,
    );
    throw lastError;
  }

  /**
   * Send a message to be retried later via RabbitMQ
   */
  async scheduleRetry(
    exchange: string,
    routingKey: string,
    message: any,
    options: RetryOptions = {},
  ): Promise<void> {
    const {
      initialDelayMs = 1000,
      backoffFactor = 2,
      retryRoutingKey,
      retryExchange,
    } = options;

    const currentRetryCount = message.retryCount || 0;
    const updatedMessage = {
      ...message,
      retryCount: currentRetryCount + 1,
      timestamp: new Date().toISOString(),
    };

    const delay = initialDelayMs * Math.pow(backoffFactor, currentRetryCount);

    // Use delay queue for retry with exponential backoff
    await this.rabbitMQService.publishWithDelay(
      retryExchange || exchange,
      retryRoutingKey || routingKey,
      updatedMessage,
      delay,
    );

    this.logger.log(
      `Scheduled retry #${updatedMessage.retryCount} in ${delay}ms for ${routingKey}`,
    );
  }
}
