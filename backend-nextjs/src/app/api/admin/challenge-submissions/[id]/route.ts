import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { ChallengeSubmissionModel } from '@/models/ChallengeSubmission';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(fail('Challenge submissions require a configured database', 'SERVICE_UNAVAILABLE', undefined, 503));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};

  const existing = await ChallengeSubmissionModel.findById(id).lean();
  if (!existing) return toResponse(fail('Submission not found', 'NOT_FOUND', undefined, 404));

  const maxMarks = Math.max(1, Number(existing.maxMarks || 100) || 100);
  const marksObtained =
    body.marksObtained === null || body.marksObtained === ''
      ? null
      : Math.min(maxMarks, Math.max(0, parseInt(String(body.marksObtained), 10) || 0));

  const item = await ChallengeSubmissionModel.findByIdAndUpdate(
    id,
    {
      status: body.status === 'pending' ? 'pending' : 'graded',
      marksObtained,
      teacherFeedback: String(body.teacherFeedback || '').trim(),
      reviewedAt: body.status === 'pending' ? null : new Date(),
    },
    { new: true }
  ).lean();

  if (!item) return toResponse(fail('Submission not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}
