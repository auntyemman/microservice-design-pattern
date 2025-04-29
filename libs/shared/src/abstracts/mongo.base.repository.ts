import {
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  Document,
} from 'mongoose';
import { PaginationResult } from '../interfaces';

export class BaseRepository<TDocument extends Document> {
  constructor(protected readonly model: Model<TDocument>) {}

  async create(data: Partial<TDocument>): Promise<TDocument> {
    const created = new this.model(data);
    return await created.save();
  }

  async findAll(
    filter: FilterQuery<TDocument> = {},
    options: QueryOptions = {},
  ): Promise<TDocument[]> {
    return await this.model.find(filter, null, options).exec();
  }

  async findOne(
    filter: FilterQuery<TDocument>,
    options: QueryOptions = {},
  ): Promise<TDocument | null> {
    return await this.model.findOne(filter, null, options).exec();
  }

  async findById(
    id: string,
    options: QueryOptions = {},
  ): Promise<TDocument | null> {
    return await this.model.findById(id, null, options).exec();
  }

  async updateOne(
    filter: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
    options: QueryOptions = { new: true },
  ): Promise<TDocument | null> {
    return await this.model.findOneAndUpdate(filter, update, options).exec();
  }

  async updateById(
    id: string,
    update: UpdateQuery<TDocument>,
    options: QueryOptions = { new: true },
  ): Promise<TDocument | null> {
    return await this.model.findByIdAndUpdate(id, update, options).exec();
  }

  async deleteOne(
    filter: FilterQuery<TDocument>,
  ): Promise<{ deletedCount?: number }> {
    return await this.model.deleteOne(filter).exec();
  }

  async deleteById(id: string): Promise<{ deletedCount?: number }> {
    return await this.model
      .deleteOne({ _id: id } as FilterQuery<TDocument>)
      .exec();
  }

  async count(filter: FilterQuery<TDocument> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<TDocument>): Promise<boolean> {
    const result = await this.model.exists(filter);
    return result !== null;
  }

  async withPagination(
    filter: FilterQuery<TDocument> = {},
    page: number = 1,
    limit: number = 10,
    options: QueryOptions = {},
    sort: Record<string, 1 | -1> = {},
  ): Promise<PaginationResult<TDocument>> {
    // Ensure page and limit are valid
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    // Calculate skip or offset value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const data = await this.model
      .find(filter, null, options)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count for pagination metadata
    const totalCount = await this.model.countDocuments(filter).exec();

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
