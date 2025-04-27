import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsArray()
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}

export class OrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;
}
