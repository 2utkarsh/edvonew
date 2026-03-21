import { ApiResponse, ApiError } from '@/types';

export function success<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return success(data, message);
}

export function created<T>(data: T, message?: string): ApiResponse<T> & { status: number } {
  const response: ApiResponse<T> & { status: number } = {
    success: true,
    message: message || 'Resource created successfully',
    data,
    status: 201,
  };
  return response;
}

export function fail(message: string, code: string = 'INTERNAL_ERROR', details?: any[], status: number = 500): ApiResponse<null> & { status: number } {
  const response: ApiResponse<null> & { status: number } = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    status,
  };
  return response;
}

export function handleError(error: any): ApiResponse<null> & { status: number } {
  console.error('Error:', error);
  return fail(
    error.message || 'Internal server error',
    'INTERNAL_ERROR',
    undefined,
    500
  );
}

export function parseJson(data: any): any {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }
}

export function validationError(details: Array<{ field: string; message: string }>): ApiResponse<null> & { status: number } {
  return fail('Validation failed', 'VALIDATION_ERROR', details, 400);
}

export function unauthorized(message: string = 'Unauthorized'): ApiResponse<null> & { status: number } {
  return fail(message, 'UNAUTHORIZED', undefined, 401);
}

export function forbidden(message: string = 'Forbidden'): ApiResponse<null> & { status: number } {
  return fail(message, 'FORBIDDEN', undefined, 403);
}

export function notFound(resource: string = 'Resource'): ApiResponse<null> & { status: number } {
  return fail(`${resource} not found`, 'NOT_FOUND', undefined, 404);
}

export function conflict(message: string): ApiResponse<null> & { status: number } {
  return fail(message, 'CONFLICT', undefined, 409);
}

export function tooManyRequests(message: string = 'Too many requests'): ApiResponse<null> & { status: number } {
  return fail(message, 'RATE_LIMIT_EXCEEDED', undefined, 429);
}

// Helper to convert our response objects to actual Response
export function toResponse<T>(result: ApiResponse<T> & { status?: number }): Response {
  const status = result.status || (result.success ? 200 : 500);
  const { status: _, ...body } = result;
  return Response.json(body, { status });
}

export function createResponse<T>(data: T, status: number = 200, message?: string, meta?: any): Response {
  const body = success(data, message, meta);
  return Response.json(body, { status });
}

export function errorResponse(error: ApiError & { status?: number }): Response {
  const status = error.status || 500;
  const { status: _, ...errorWithoutStatus } = error;
  const body: ApiResponse<null> = {
    success: false,
    error: errorWithoutStatus,
  };
  return Response.json(body, { status });
}
