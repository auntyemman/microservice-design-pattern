export interface AuthServiceClient {
  validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse>;
  getUser(data: GetUserRequest): Promise<GetUserResponse>;
  getUsers(data: GetUsersRequest): Promise<GetUsersResponse>;
  createUser(data: CreateUserRequest): Promise<CreateUserResponse>;
  updateUser(data: UpdateUserRequest): Promise<UpdateUserResponse>;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  userId: string;
  email: string;
  roles: string[];
}

export interface GetUserRequest {
  id: string;
}

export interface GetUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersRequest {
  page: number;
  limit: number;
}

export interface GetUsersResponse {
  users: GetUserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  updatedAt: string;
}
