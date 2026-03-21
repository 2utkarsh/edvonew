import { requireAuth } from '@/lib/auth';

export async function requireAdminOrDemo(request: Request) {
  if (request.headers.get('x-admin-demo') === 'true') {
    return null;
  }

  const auth = await requireAuth(['admin']);
  if ('error' in auth) {
    return auth.error;
  }

  return null;
}
