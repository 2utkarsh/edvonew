import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok } from '@/lib/http';
import { ContactMessageModel } from '@/models/ContactMessage';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const item = await ContactMessageModel.findById(id).lean();
    if (!item) return fail('Contact message not found', 404);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const item = await ContactMessageModel.findByIdAndDelete(id).lean();
    if (!item) return fail('Contact message not found', 404);
    return ok({ deleted: true, id });
  } catch (error) {
    return handleError(error);
  }
}
