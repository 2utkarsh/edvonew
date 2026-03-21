import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { BlogCategoryModel } from '@/models/Blog';

export async function GET(): Promise<Response> {
  try {
    await connectToDatabase();
    const items = await BlogCategoryModel.find({ status: 'active' }).sort({ sort: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
