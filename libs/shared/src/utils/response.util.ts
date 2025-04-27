import { PaginationResult } from '../interfaces/';

export class ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | T[] | PaginationResult<T> | null;
  error?: any;

  constructor(
    message: string,
    data?: T | T[] | PaginationResult<T> | null,
    error?: any,
  ) {
    this.status = error ? 'error' : 'success';
    this.message = message;
    this.data = data ?? null;
    this.error = error;
  }
}
