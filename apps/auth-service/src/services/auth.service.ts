import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { RegisterUserDto, LoginUserDto } from '@app/shared/dto/auth.dto';
import {
  TokenResponse,
  AuthResponse,
} from '@app/shared/interfaces/auth.interface';
import { UserProducer } from '../producers/user.producer';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly userProducer: UserProducer,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      email: registerDto.email,
    });
    if (existingUser) {
      throw new ConflictException('User with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Emit user created event
    await this.userProducer.userCreated({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });

    // Return response without password
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens,
    };
  }

  async login(loginDto: LoginUserDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findOne({
      email: loginDto.email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Return response without password
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.sub);

      return {
        valid: true,
        userId: user.id,
        email: user.email,
        roles: [],
      };
    } catch (error) {
      return {
        valid: false,
        userId: null,
        email: null,
        roles: [],
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findById(payload.sub);
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: any): TokenResponse {
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      expiresIn: 3600, // 1 hour in seconds
    };
  }
}
