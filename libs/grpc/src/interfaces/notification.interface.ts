export interface NotificationServiceClient {
  sendEmail(data: SendEmailRequest): Promise<SendEmailResponse>;
  sendSms(data: SendSmsRequest): Promise<SendSmsResponse>;
  getUserNotifications(
    data: GetUserNotificationsRequest,
  ): Promise<GetUserNotificationsResponse>;
}

export interface SendEmailRequest {
  email: string;
  subject: string;
  body: string;
  template?: string;
  contextData?: Record<string, string>;
}

export interface SendEmailResponse {
  id: string;
  success: boolean;
  message: string;
}

export interface SendSmsRequest {
  phoneNumber: string;
  message: string;
}

export interface SendSmsResponse {
  id: string;
  success: boolean;
  message: string;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface GetUserNotificationsRequest {
  userId: string;
  page: number;
  limit: number;
}

export interface GetUserNotificationsResponse {
  notifications: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}
