import { Controller, Get } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller()
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  getHello(): string {
    return this.adminDashboardService.getHello();
  }
}
