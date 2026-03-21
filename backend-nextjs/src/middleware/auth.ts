import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { Role } from '@/types';

export interface AuthMiddlewareOptions {
  roles?: Role[];
  optional?: boolean;
}

export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  return async function (
    request: NextRequest,
    handler: (request: NextRequest, payload?: any) => Promise<Response>
  ): Promise<Response> {
    const { roles, optional } = options;

    try {
      const authResult = await requireAuth(roles);

      if (authResult.error) {
        if (optional) {
          return handler(request, null);
        }
        return errorResponse(authResult.error);
      }

      return handler(request, authResult.payload);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return errorResponse({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        status: 500,
      });
    }
  };
}

export function rateLimitMiddleware(windowMs: number, maxRequests: number) {
  const requestMap = new Map<string, { count: number; resetTime: number }>();

  return async function (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<Response>
  ): Promise<Response> {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    let record = requestMap.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      requestMap.set(ip, record);
    } else {
      record.count++;
    }

    if (record.count > maxRequests) {
      return errorResponse({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        status: 429,
      });
    }

    return handler(request);
  };
}

export async function validateRequest<T>(
  request: NextRequest,
  schema: { parseAsync: (data: any) => Promise<T> }
): Promise<{ data?: T; error?: Response }> {
  try {
    const contentType = request.headers.get('content-type');
    let body: any;

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      body = await request.text();
    }

    const data = await schema.parseAsync(body);
    return { data };
  } catch (error: any) {
    if (error.errors) {
      const details = error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        error: errorResponse({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
          status: 400,
        }),
      };
    }

    return {
      error: errorResponse({
        code: 'INVALID_JSON',
        message: 'Invalid request body',
        status: 400,
      }),
    };
  }
}
