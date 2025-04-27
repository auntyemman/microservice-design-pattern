import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailNotificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  contextData?: Record<string, any>;
}

export class SendSmsNotificationDto {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
