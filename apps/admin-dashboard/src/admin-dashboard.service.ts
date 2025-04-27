import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminDashboardService {
  getHello(): string {
    return 'Hello World!';
  }
}
