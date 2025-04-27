export * from './event.interface';

export interface RabbitMQModuleOptions {
  name?: string;
  config?: any;
}
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
