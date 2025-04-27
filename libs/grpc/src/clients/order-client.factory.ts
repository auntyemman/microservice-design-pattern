import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { GRPC } from '@app/shared/constants';

export const orderClientFactory = {
  provide: 'ORDER_CLIENT',
  useFactory: () => {
    return ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: GRPC.ORDER_PACKAGE,
        protoPath: join(__dirname, '../protos/order.proto'),
        url: process.env.ORDER_SERVICE_URL || 'localhost:50052',
      },
    });
  },
};

export const getOrderServiceClient = (client: ClientGrpc) => {
  return client.getService<any>(GRPC.ORDER_SERVICE_NAME);
};
