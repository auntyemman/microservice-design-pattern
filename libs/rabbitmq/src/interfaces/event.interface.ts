export interface UserCreatedEvent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface UserUpdatedEvent {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  updatedAt: string;
}

export interface OrderCreatedEvent {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress?: string;
  createdAt: string;
}

export interface OrderUpdatedEvent {
  id: string;
  status: string;
  updatedAt: string;
}

export interface OrderConfirmedEvent {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  updatedAt: string;
}

export interface EmailNotificationEvent {
  userId: string;
  email: string;
  subject: string;
  body: string;
  template?: string;
  contextData?: Record<string, any>;
}

export interface SmsNotificationEvent {
  userId: string;
  phoneNumber: string;
  message: string;
}
