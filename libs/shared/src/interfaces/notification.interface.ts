export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  type: string;
  status: string;
  createdAt: Date;
}
