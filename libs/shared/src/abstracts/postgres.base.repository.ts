import {
  Repository,
  FindOptionsWhere,
  FindOneOptions,
  DeepPartial,
  ObjectLiteral,
  FindManyOptions,
  FindOptionsOrder,
} from 'typeorm';
import { PaginationResult } from '../interfaces/pagination.interface';

export class PostgresBaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(
    where: FindOptionsWhere<T> = {},
    options: Partial<FindManyOptions<T>> = {},
  ): Promise<T[]> {
    return await this.repository.find({
      where,
      ...options,
    });
  }

  async findOne(
    where: FindOptionsWhere<T>,
    options: Partial<FindOneOptions<T>> = {},
  ): Promise<T | null> {
    return await this.repository.findOne({
      where,
      ...options,
    });
  }

  async findById(
    id: string,
    options: Partial<FindOneOptions<T>> = {},
  ): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      ...options,
    });
  }

  async updateOne(
    where: FindOptionsWhere<T>,
    update: Partial<T>,
  ): Promise<T | null> {
    await this.repository.update(where, update);
    return await this.findOne(where);
  }

  async updateById(id: string, update: Partial<T>): Promise<T | null> {
    await this.repository.update(id, update);
    return await this.findById(id);
  }

  async deleteOne(
    where: FindOptionsWhere<T>,
  ): Promise<{ deletedCount?: number }> {
    const result = await this.repository.delete(where);
    return { deletedCount: result.affected ?? 0 };
  }

  async deleteById(id: string): Promise<{ deletedCount?: number }> {
    const result = await this.repository.delete(id);
    return { deletedCount: result.affected ?? 0 };
  }

  async count(where: FindOptionsWhere<T> = {}): Promise<number> {
    return await this.repository.count({ where });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async withPagination(
    where: FindOptionsWhere<T> = {},
    page: number = 1,
    limit: number = 10,
    options: Partial<FindManyOptions<T>> = {},
    order: FindOptionsOrder<T> = {},
  ): Promise<PaginationResult<T>> {
    // Ensure page and limit are valid
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    // Calculate skip or offset value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const data = await this.repository.find({
      where,
      skip,
      take: limit,
      order,
      ...options,
    });

    // Get total count for pagination metadata
    const totalCount = await this.repository.count({ where });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Return paginated result
    return {
      data,
      currentPage: page,
      totalPages,
      totalCount,
      pageSize: limit,
      hasNextPage,
      hasPreviousPage,
    };
  }
}
