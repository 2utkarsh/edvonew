export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Meta;
  error?: ApiError;
}

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export type Role = 'student' | 'instructor' | 'admin';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface CourseFilters {
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
}

export interface ExamFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  duration?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface JobFilters {
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  mode?: 'remote' | 'onsite' | 'hybrid';
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
}
