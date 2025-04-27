export interface OrderServiceClient {
  getOrder(data: GetOrderRequest): Promise<GetOrderResponse>;
  getUserOrders(data: GetUserOrdersRequest): Promise<GetUserOrdersResponse>;
  createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse>;
  updateOrderStatus(
    data: UpdateOrderStatusRequest,
  ): Promise<UpdateOrderStatusResponse>;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface GetOrderRequest {
  id: string;
}

export interface GetOrderResponse {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserOrdersRequest {
  userId: string;
  page: number;
  limit: number;
}

export interface GetUserOrdersResponse {
  orders: GetOrderResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  shippingAddress: string;
}

export interface CreateOrderResponse {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
}

export interface UpdateOrderStatusRequest {
  id: string;
  status: string;
}

export interface UpdateOrderStatusResponse {
  id: string;
  status: string;
  updatedAt: string;
}
