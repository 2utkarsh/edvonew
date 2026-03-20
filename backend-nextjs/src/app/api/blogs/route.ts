import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { BlogModel } from '@/models/Blog';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await BlogModel.find({ status: 'published' }).sort({ updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
