export interface Job<T = any> {
  id?: string;
  type: string;
  payload: T;
  priority?: number;
  createdAt: number;
  scheduledFor?: number;
  retryCount?: number;
  maxRetries?: number;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  maxRetries?: number;
}
