import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { BlogCategoryModel } from '@/models/Blog';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await BlogCategoryModel.find({ status: 'active' }).sort({ sort: 1, updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
