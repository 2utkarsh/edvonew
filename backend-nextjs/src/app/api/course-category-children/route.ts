import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { CourseCategoryChildModel } from '@/models/CourseCategory';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await CourseCategoryChildModel.find({ status: true }).sort({ sort: 1, updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}
