export interface RabbitMQExchange {
  name: string;
  type: string;
  options?: {
    arguments?: Record<string, any>;
    durable?: boolean;
    autoDelete?: boolean;
    internal?: boolean;
    [key: string]: any;
  };
}

export interface RabbitMQQueue {
  name: string;
  options?: {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    arguments?: {
      'x-dead-letter-exchange'?: string;
      'x-dead-letter-routing-key'?: string;
      'x-message-ttl'?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface RabbitMQBinding {
  exchange: string;
  routingKey: string;
  queue: string;
}

export interface RabbitMQConfig {
  exchanges: RabbitMQExchange[];
  queues: RabbitMQQueue[];
  bindings: RabbitMQBinding[];
}

export interface RabbitMQModuleOptions {
  name?: string;
  config: RabbitMQConfig;
}
