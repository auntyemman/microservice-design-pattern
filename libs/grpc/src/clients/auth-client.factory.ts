import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { GRPC } from '@app/shared/constants';

export const authClientFactory = {
  provide: 'AUTH_CLIENT',
  useFactory: () => {
    return ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: GRPC.AUTH_PACKAGE,
        protoPath: join(__dirname, '../protos/auth.proto'),
        url: process.env.AUTH_SERVICE_URL || 'localhost:50051',
      },
    });
  },
};

export const getAuthServiceClient = (client: ClientGrpc) => {
  return client.getService<any>(GRPC.AUTH_SERVICE_NAME);
};
