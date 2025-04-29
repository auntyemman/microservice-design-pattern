import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto, LoginUserDto } from '@app/shared/dto/auth.dto';
// import { AuthResponse } from '@app/shared/interfaces/auth.interface';
// import { ResponseUtil } from '@app/shared/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    const result = await this.authService.register(registerDto);
    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    const result = await this.authService.login(loginDto);
    return result;
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const result = await this.authService.refreshToken(body.refreshToken);
    return result;
  }
}
