import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserProducer } from './producers/user.producer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userProducer: UserProducer,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      createdAt: new Date(),
    });

    await this.userRepository.save(user);

    // Emit user created event
    await this.userProducer.userCreated({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });

    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, {
      ...userData,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOneBy({ id });

    // Emit user updated event
    await this.userProducer.userUpdated({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      updatedAt: updatedUser.updatedAt.toISOString(),
    });

    return updatedUser;
  }
}
