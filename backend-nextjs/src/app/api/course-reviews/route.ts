import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { ReviewModel } from '@/models/Review';

function formatReview(item: any) {
  const course = item.courseId || {};
  const user = item.userId || {};
  return {
    id: String(item._id),
    rating: Number(item.rating || 0),
    comment: String(item.comment || ''),
    helpful: Number(item.helpful || 0),
    order: Number(item.order || 0),
    status: item.isApproved === false ? 'inactive' : 'active',
    category: String(course.category || 'General'),
    courseId: String(course._id || ''),
    courseName: String(course.title || 'EDVO Course'),
    courseSlug: String(course.slug || ''),
    reviewerName: String(user.name || 'EDVO Learner'),
    reviewerAvatar: String(user.photo || user.avatar || '/images/edvo-official-logo-v10.png'),
    reviewerRole: String(user.headline || 'Learner'),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    await ensureSeededContent();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const items = await ReviewModel.find({ isApproved: true })
      .populate('courseId', 'title slug category')
      .populate('userId', 'name photo avatar headline')
      .sort({ order: 1, updatedAt: -1 })
      .lean();

    const mapped = items.map(formatReview).filter((item) => !category || item.category === category);
    return toResponse(ok(mapped));
  } catch (error) {
    return handleError(error);
  }
}
