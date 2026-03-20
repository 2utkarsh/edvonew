import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { CourseCategoryChildModel, CourseCategoryModel } from '@/models/CourseCategory';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await CourseCategoryModel.find({ status: true }).sort({ sort: 1, updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
