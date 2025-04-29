import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserDto } from '@app/shared/dto/auth.dto';
import { UserResponse } from '@app/shared/interfaces/auth.interface';
import { UserProducer } from '../producers/user.producer';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProducer: UserProducer,
  ) {}

  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    return this.mapToUserResponse(user);
  }

  async findAll(page: number, limit: number): Promise<UserResponse> {
    const users = await this.userRepository.withPagination(
      {},
      page,
      limit,
      {},
      { createdAt: 'DESC' },
    );
    return this.mapToUserResponse(users);
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.updateById(id, updateDto);

    // Emit user updated event
    await this.userProducer.userUpdated({
      id: user.id,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      email: updateDto.email,
      updatedAt: user.updatedAt.toISOString(),
    });

    return this.mapToUserResponse(user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  private mapToUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
