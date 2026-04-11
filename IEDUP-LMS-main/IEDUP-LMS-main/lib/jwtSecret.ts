const DEV_JWT_SECRET = 'local-development-jwt-secret';

export const JWT_SECRET =
  process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : DEV_JWT_SECRET);

export const hasJwtSecret = JWT_SECRET.length > 0;

export function getJwtSecretBytes() {
  return new TextEncoder().encode(JWT_SECRET);
}
