import { getFallbackCourseReviews } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ensureSeededContent } from '@/lib/content-seeder';
import { fetchManualCourseReviews, fetchSubmittedCourseReviews, formatManualCourseReview } from '@/lib/course-review-utils';
import { CourseReviewItemModel } from '@/models/CourseReviewItem';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackCourseReviews()));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const [submitted, manual] = await Promise.all([fetchSubmittedCourseReviews(), fetchManualCourseReviews()]);
  const items = submitted.concat(manual).sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

  return toResponse(ok(items));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const reviewerName = String(body.reviewerName || '').trim();
  const courseName = String(body.courseName || '').trim();
  const category = String(body.category || '').trim();
  const comment = String(body.comment || '').trim();
  const reviewerAvatar = String(body.reviewerAvatar || '').trim() || '/images/edvo-official-logo-v10.png';

  if (!reviewerName || !courseName || !category || !comment) {
    return toResponse(fail('Reviewer name, course name, category, and review are required', 'VALIDATION_ERROR', undefined, 400));
  }

  const item = await CourseReviewItemModel.create({
    reviewerName,
    reviewerAvatar,
    reviewerRole: String(body.reviewerRole || 'Learner').trim() || 'Learner',
    courseName,
    courseSlug: String(body.courseSlug || '').trim(),
    category,
    rating: Math.max(1, Math.min(5, parseInt(String(body.rating || 5), 10) || 5)),
    comment,
    helpful: parseInt(String(body.helpful || 0), 10) || 0,
    externalUrl: String(body.externalUrl || '').trim(),
    sourceLabel: String(body.sourceLabel || 'External Review').trim() || 'External Review',
    status: String(body.status || 'active') === 'inactive' ? 'inactive' : 'active',
    order: parseInt(String(body.order || 0), 10) || 0,
  });

  return toResponse(created(formatManualCourseReview(item.toObject())));
}
