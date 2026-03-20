import { NextResponse } from 'next/server';

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function created(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: 201, ...(init || {}) });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, message, ...(extra || {}) }, { status });
}

export async function parseJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function handleError(error: unknown) {
  console.error(error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  return fail(message, 500);
}

