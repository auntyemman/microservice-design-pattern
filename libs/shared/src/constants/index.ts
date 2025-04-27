export const SERVICE_NAMES = {
  AUTH_SERVICE: 'AUTH_SERVICE',
  ORDER_SERVICE: 'ORDER_SERVICE',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE',
};

export const RABBITMQ = {
  CLIENT: 'RABBITMQ_CLIENT',
  EXCHANGES: {
    USER_EVENTS: 'user_events',
    ORDER_EVENTS: 'order_events',
    NOTIFICATION_EVENTS: 'notification_events',
    DELAYED: 'delayed_exchange', // For delayed/scheduled jobs
    RETRY: 'retry_exchange', // For retry mechanism
  },
  QUEUES: {
    // Regular message queues
    USER_CREATED: 'user_created_queue',
    USER_UPDATED: 'user_updated_queue',
    ORDER_CREATED: 'order_created_queue',
    ORDER_CONFIRMED: 'order_confirmed_queue',
    NOTIFICATION_EMAIL: 'notification_email_queue',
    NOTIFICATION_SMS: 'notification_sms_queue',

    // Background job queues
    BACKGROUND_JOBS: 'background_jobs_queue',
    SCHEDULED_TASKS: 'scheduled_tasks_queue',

    // Retry queues
    USER_RETRY: 'user_retry_queue',
    ORDER_RETRY: 'order_retry_queue',
    NOTIFICATION_RETRY: 'notification_retry_queue',
  },
  ROUTING_KEYS: {
    // Event routing keys
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_CONFIRMED: 'order.confirmed',
    NOTIFICATION_EMAIL: 'notification.email',
    NOTIFICATION_SMS: 'notification.sms',

    // Background job routing keys
    BACKGROUND_JOB: 'job.background',
    SCHEDULED_TASK: 'job.scheduled',

    // Retry routing keys
    USER_RETRY: 'retry.user',
    ORDER_RETRY: 'retry.order',
    NOTIFICATION_RETRY: 'retry.notification',
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

export const REDIS = {
  CACHE_TTL: 60 * 60, // 1 hour in seconds
  KEY_PATTERNS: {
    USER: 'user:{id}',
    USERS: 'users:list',
    AUTH_TOKEN: 'auth:token:{token}',
    ORDER: 'order:{id}',
    ORDERS: 'orders:list',
  },
};
