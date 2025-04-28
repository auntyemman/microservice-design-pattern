import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth-service.service';

@Controller()
export class UserController {
  constructor(private readonly authServiceService: AuthService) {}
}