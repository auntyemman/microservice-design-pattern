import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export abstract class BaseProducer implements OnModuleInit {
  constructor(
    @Inject(abstract) private readonly client: ClientProxy,
    private readonly serviceName: string,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async emit<T>(pattern: string, data: T): Promise<void> {
    try {
      await firstValueFrom(
        this.client.emit(pattern, { data, service: this.serviceName }),
      );
    } catch (error) {
      console.error(`Error emitting event ${pattern}:`, error);
      throw error;
    }
  }

  async send<T, R>(pattern: string, data: T): Promise<R> {
    try {
      return await firstValueFrom(
        this.client.send(pattern, { data, service: this.serviceName }),
      );
    } catch (error) {
      console.error(`Error sending message ${pattern}:`, error);
      throw error;
    }
  }
}
