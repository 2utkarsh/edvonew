import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { BlogModel } from '@/models/Blog';

export async function GET(): Promise<Response> {
  try {
    await connectToDatabase();
    const items = await BlogModel.find({ status: 'published' }).sort({ updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
