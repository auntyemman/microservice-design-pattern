export interface PaginationResult<T> {
  data: T[]; // Array of items for the current page
  currentPage: number; // Current page number
  totalPages: number; // Total number of pages
  totalCount: number; // Total number of items
  pageSize: number; // Number of items per page
  hasNextPage: boolean; // Indicates if there is a next page
  hasPreviousPage: boolean; // Indicates if there is a previous page
}
