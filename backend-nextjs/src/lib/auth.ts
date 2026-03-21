import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { fail, unauthorized } from '@/lib/http';
import { AuthTokenPayload, Role } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type { AuthTokenPayload, Role };

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export async function getAuthPayload(): Promise<AuthTokenPayload | null> {
  const headerStore = await headers();
  const authorization = headerStore.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(roles?: Role[]): Promise<{ payload: AuthTokenPayload } | { error: any }> {
  const payload = await getAuthPayload();
  
  if (!payload) {
    return { error: unauthorized('Unauthorized') };
  }

  if (roles && roles.length > 0 && !roles.includes(payload.role)) {
    return { error: unauthorized('Insufficient permissions') };
  }

  return { payload };
}
