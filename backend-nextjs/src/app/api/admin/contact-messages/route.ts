import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, parseJson } from '@/lib/http';
import { ContactMessageModel } from '@/models/ContactMessage';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
