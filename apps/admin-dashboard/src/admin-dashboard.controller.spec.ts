import { Test, TestingModule } from '@nestjs/testing';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardController', () => {
  let adminDashboardController: AdminDashboardController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminDashboardController],
      providers: [AdminDashboardService],
    }).compile();

    adminDashboardController = app.get<AdminDashboardController>(
      AdminDashboardController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(adminDashboardController.getHello()).toBe('Hello World!');
    });
  });
});
