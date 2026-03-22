import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { CourseReviewItemModel } from '@/models/CourseReviewItem';
import { ReviewModel } from '@/models/Review';
import { formatManualCourseReview } from '@/lib/course-review-utils';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const manual = await CourseReviewItemModel.findById(id);

  if (manual) {
    if (body.reviewerName !== undefined) manual.reviewerName = String(body.reviewerName || '').trim() || manual.reviewerName;
    if (body.reviewerAvatar !== undefined) manual.reviewerAvatar = String(body.reviewerAvatar || '').trim() || manual.reviewerAvatar;
    if (body.reviewerRole !== undefined) manual.reviewerRole = String(body.reviewerRole || '').trim() || 'Learner';
    if (body.courseName !== undefined) manual.courseName = String(body.courseName || '').trim() || manual.courseName;
    if (body.courseSlug !== undefined) manual.courseSlug = String(body.courseSlug || '').trim();
    if (body.category !== undefined) manual.category = String(body.category || '').trim() || manual.category;
    if (body.rating !== undefined) manual.rating = Math.max(1, Math.min(5, parseInt(String(body.rating || manual.rating), 10) || manual.rating));
    if (body.comment !== undefined) manual.comment = String(body.comment || '').trim() || manual.comment;
    if (body.helpful !== undefined) manual.helpful = parseInt(String(body.helpful || manual.helpful), 10) || 0;
    if (body.externalUrl !== undefined) manual.externalUrl = String(body.externalUrl || '').trim();
    if (body.sourceLabel !== undefined) manual.sourceLabel = String(body.sourceLabel || '').trim() || 'External Review';
    if (body.status !== undefined) manual.status = String(body.status) === 'inactive' ? 'inactive' : 'active';
    if (body.isApproved !== undefined) manual.status = Boolean(body.isApproved) ? 'active' : 'inactive';
    if (body.order !== undefined) manual.order = parseInt(String(body.order), 10) || 0;
    await manual.save();
    return toResponse(ok(formatManualCourseReview(manual.toObject())));
  }

  const update: Record<string, unknown> = {};
  if (body.isApproved !== undefined) update.isApproved = Boolean(body.isApproved);
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;

  const item = await ReviewModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Course review not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ id, updated: true }));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const manual = await CourseReviewItemModel.findByIdAndDelete(id).lean();
  if (!manual) return toResponse(fail('Manual course review not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
