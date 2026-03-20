import { connectToDatabase } from '@/lib/db';
import { ok, handleError } from '@/lib/http';

export async function GET() {
  try {
    await connectToDatabase();
    return ok({ status: 'ok', service: 'edvo-nextjs-backend' });
  } catch (error) {
    return handleError(error);
  }
}

