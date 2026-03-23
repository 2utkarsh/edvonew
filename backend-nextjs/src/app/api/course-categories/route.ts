import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { CourseCategoryModel } from '@/models/CourseCategory';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await CourseCategoryModel.find({ isActive: true })
      .sort({ order: 1, updatedAt: -1 })
      .lean();

    return ok(
      items.map((item) => ({
        id: String(item._id),
        name: item.name,
        slug: item.slug,
        description: item.description,
        icon: item.icon,
        color: item.color,
        order: item.order,
        isActive: item.isActive,
        courseCount: item.courseCount,
      }))
    );
  } catch (error) {
    return handleError(error);
  }
}
