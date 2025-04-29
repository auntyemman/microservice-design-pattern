import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import {
  ValidateTokenRequest,
  ValidateTokenResponse,
  GetUserRequest,
  GetUserResponse,
  GetUsersRequest,
  GetUsersResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from '@app/grpc/interfaces/auth.interface';
import { GRPC } from '@app/shared/constants';
import { RegisterUserDto, UpdateUserDto } from '@app/shared/dto/auth.dto';

@Controller()
export class UserGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @GrpcMethod(GRPC.AUTH_SERVICE_NAME, 'ValidateToken')
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return this.authService.validateToken(data.token);
  }

  @GrpcMethod(GRPC.AUTH_SERVICE_NAME, 'GetUser')
  async getUser(data: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userService.findById(data.id);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  // TODO: maybe use grpc stream for this
  //   @GrpcMethod(GRPC.AUTH_SERVICE_NAME, 'GetUsers')
  //   async getUsers(data: GetUsersRequest): Promise<GetUsersResponse> {
  //     const result = await this.userService.findAll(data.page, data.limit);
  //     return {
  //       users: result.users.map((user) => ({
  //         id: user.id,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         email: user.email,
  //         createdAt: user.createdAt.toISOString(),
  //         updatedAt: user.updatedAt.toISOString(),
  //       })),
  //       total: result.total,
  //       page: result.page,
  //       limit: result.limit,
  //     };
  //   }

  @GrpcMethod(GRPC.AUTH_SERVICE_NAME, 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const registerDto: RegisterUserDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };

    const result = await this.authService.register(registerDto);
    const user = result.user;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @GrpcMethod(GRPC.AUTH_SERVICE_NAME, 'UpdateUser')
  async updateUser(data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const updateDto: UpdateUserDto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    };

    const user = await this.userService.update(data.id, updateDto);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
