import { PaginationQuery, Meta } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  meta: Meta;
}

export function buildPagination(query: PaginationQuery, total: number): Meta {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
}

export function buildQueryOptions(query: PaginationQuery): {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
} {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const skip = (page - 1) * limit;

  const sortField = query.sort || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  return {
    skip,
    limit,
    sort: {
      [sortField]: sortOrder as 1 | -1,
    },
  };
}

export function applySearch<T extends Record<string, any>>(
  searchQuery: string | undefined,
  searchableFields: (keyof T)[]
): Record<string, any> {
  if (!searchQuery) return {};

  const searchConditions = searchableFields.map((field) => ({
    [field]: { $regex: searchQuery, $options: 'i' },
  }));

  return searchConditions.length > 0 ? { $or: searchConditions } : {};
}
