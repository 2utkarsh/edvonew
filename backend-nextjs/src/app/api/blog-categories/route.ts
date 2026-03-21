import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { BlogCategoryModel } from '@/models/Blog';

export async function GET(): Promise<Response> {
  try {
    await connectToDatabase();
    const items = await BlogCategoryModel.find({ isActive: true }).sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items));
  } catch (error) {
    return handleError(error);
  }
}
