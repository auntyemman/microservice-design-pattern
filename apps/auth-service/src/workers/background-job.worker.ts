// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { WorkerService } from '@app/rabbitmq/rabbitmq.worker-service';
// import { RABBITMQ } from '@app/shared/constants';

// interface BackgroundJob {
//   taskType: string;
//   data: any;
//   createdAt: string;
//   retryCount?: number;
// }

// @Injectable()
// export class BackgroundJobsWorker implements OnModuleInit {
//   private readonly logger = new Logger(BackgroundJobsWorker.name);

//   constructor(private readonly workerService: WorkerService) {}

//   onModuleInit() {
//     this.registerWorkers();
//   }

//   private registerWorkers() {
//     // Register background job worker
//     this.workerService.registerWorker<BackgroundJob>(
//       RABBITMQ.QUEUES.BACKGROUND_JOBS,
//       async (job) => {
//         this.logger.log(`Processing background job: ${job.taskType}`);

//         switch (job.taskType) {
//           case 'BULK_EMAIL':
//             await this.processBulkEmail(job.data);
//             break;
//           case 'USER_REPORT':
//             await this.generateUserReport(job.data);
//             break;
//           default:
//             this.logger.warn(`Unknown job type: ${job.taskType}`);
//         }
//       },
//       {
//         maxRetries: 3,
//         retryDelayMs: 5000,
//         concurrency: 5,
//         timeout: 5 * 60 * 1000, // 5 minutes for long-running tasks
//       },
//     );

//     // Register scheduled tasks worker
//     this.workerService.registerWorker(
//       RABBITMQ.QUEUES.SCHEDULED_TASKS,
//       async (task) => {
//         this.logger.log(`Processing scheduled task: ${task.taskType}`);

//         switch (task.taskType) {
//           case 'CLEANUP_EXPIRED_TOKENS':
//             await this.cleanupExpiredTokens();
//             break;
//           case 'USER_ACTIVITY_REPORT':
//             await this.generateUserActivityReport();
//             break;
//           default:
//             this.logger.warn(`Unknown scheduled task type: ${task.taskType}`);
//         }
//       },
//       {
//         maxRetries: 2,
//         retryDelayMs: 30000,
//       },
//     );

//     // Start all workers
//     this.workerService.startAll().catch((err) => {
//       this.logger.error('Failed to start workers', err);
//     });
//   }

//   private async processBulkEmail(data: any): Promise<void> {
//     const { userIds } = data;
//     this.logger.log(`Processing bulk email for ${userIds.length} users`);

//     // Simulate processing chunks of users
//     const chunkSize = 100;
//     for (let i = 0; i < userIds.length; i += chunkSize) {
//       const chunk = userIds.slice(i, i + chunkSize);

//       this.logger.log(
//         `Processing email chunk ${i / chunkSize + 1}, size: ${chunk.length}`,
//       );

//       // Simulate email sending (would integrate with email service)
//       // publish email event to the notification service to handle for each user or bulk
//       await new Promise((resolve) => setTimeout(resolve, 200));
//     }

//     this.logger.log('Bulk email processing completed');
//   }

//   private async generateUserReport(data: any): Promise<void> {
//     this.logger.log('Generating user report');
//     // Implement report generation logic
//     await new Promise((resolve) => setTimeout(resolve, 3000));
//     this.logger.log('User report generation completed');
//   }

//   private async cleanupExpiredTokens(): Promise<void> {
//     this.logger.log('Cleaning up expired tokens');
//     // Implement token cleanup logic
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     this.logger.log('Token cleanup completed');
//   }

//   private async generateUserActivityReport(): Promise<void> {
//     this.logger.log('Generating user activity report');
//     // Implement activity report logic
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     this.logger.log('User activity report generated');
//   }
// }
