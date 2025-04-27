import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationDTO {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  page: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  limit: number;
}
