import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { fail } from '@/lib/http';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type AuthTokenPayload = {
  sub: string;
  role: 'student' | 'instructor' | 'admin';
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(payload: AuthTokenPayload) {
  return (jwt.sign as any)(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export async function getAuthPayload() {
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

export async function requireAuth(roles?: Array<'student' | 'instructor' | 'admin'>) {
  const payload = await getAuthPayload();
  if (!payload) {
    return { error: fail('Unauthorized', 401) };
  }

  if (roles && roles.length > 0 && !roles.includes(payload.role)) {
    return { error: fail('Forbidden', 403) };
  }

  return { payload };
}
