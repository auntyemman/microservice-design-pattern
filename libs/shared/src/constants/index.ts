export const SERVICE_NAMES = {
  AUTH_SERVICE: 'AUTH_SERVICE',
  ORDER_SERVICE: 'ORDER_SERVICE',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE',
};

export const RABBITMQ = {
  EXCHANGES: {
    USER_EVENTS: 'user_events',
    ORDER_EVENTS: 'order_events',
    NOTIFICATION_EVENTS: 'notification_events',
  },
  QUEUES: {
    USER_CREATED: 'user_created_queue',
    ORDER_CREATED: 'order_created_queue',
    ORDER_CONFIRMED: 'order_confirmed_queue',
    NOTIFICATION_EMAIL: 'notification_email_queue',
    NOTIFICATION_SMS: 'notification_sms_queue',
  },
  ROUTING_KEYS: {
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_CONFIRMED: 'order.confirmed',
    NOTIFICATION_EMAIL: 'notification.email',
    NOTIFICATION_SMS: 'notification.sms',
  },
};

export const GRPC = {
  AUTH_PACKAGE: 'auth',
  ORDER_PACKAGE: 'order',
  NOTIFICATION_PACKAGE: 'notification',
  AUTH_SERVICE_NAME: 'AuthService',
  ORDER_SERVICE_NAME: 'OrderService',
  NOTIFICATION_SERVICE_NAME: 'NotificationService',
};

export const REDIS_CACHE_TTL = 60 * 60 * 1; // 1 hour in seconds
