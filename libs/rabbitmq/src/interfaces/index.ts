export * from './event.interface';

export interface RabbitMQConfig {
  exchanges: {
    [key: string]: {
      name: string;
      type: string;
    };
  };
  queues: {
    [key: string]: {
      name: string;
      options: any;
    };
  };
  bindings: {
    [key: string]: {
      queue: string;
      exchange: string;
      routingKey: string;
    };
  };
}
