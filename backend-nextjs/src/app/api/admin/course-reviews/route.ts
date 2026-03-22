import { connectToDatabase } from '@/lib/db';
import { ok, toResponse } from '@/lib/http';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
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
    isApproved: item.isApproved === false ? false : true,
    category: String(course.category || 'General'),
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
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await ReviewModel.find()
    .populate('courseId', 'title slug category')
    .populate('userId', 'name photo avatar headline')
    .sort({ order: 1, updatedAt: -1 })
    .lean();

  return toResponse(ok(items.map(formatReview)));
}
