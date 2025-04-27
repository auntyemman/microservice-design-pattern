import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { GRPC } from '@app/shared/constants';

export const notificationClientFactory = {
  provide: 'NOTIFICATION_CLIENT',
  useFactory: () => {
    return ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: GRPC.NOTIFICATION_PACKAGE,
        protoPath: join(__dirname, '../protos/notification.proto'),
        url: process.env.NOTIFICATION_SERVICE_URL || 'localhost:50053',
      },
    });
  },
};

export const getNotificationServiceClient = (client: ClientGrpc) => {
  return client.getService<any>(GRPC.NOTIFICATION_SERVICE_NAME);
};
