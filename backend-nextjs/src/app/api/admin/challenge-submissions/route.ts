import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ok, toResponse } from '@/lib/http';
import { ChallengeSubmissionModel } from '@/models/ChallengeSubmission';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok([]));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const { searchParams } = new URL(request.url);
  const challengeSlug = String(searchParams.get('challengeSlug') || '').trim();
  const query = challengeSlug ? { challengeSlug } : {};

  const items = await ChallengeSubmissionModel.find(query).sort({ createdAt: -1 }).lean();

  return toResponse(
    ok(
      items.map((item) => ({
        id: String(item._id || ''),
        challengeId: item.challengeId || '',
        challengeSlug: item.challengeSlug,
        challengeTitle: item.challengeTitle,
        studentName: item.studentName,
        studentEmail: item.studentEmail,
        answerText: item.answerText,
        attachmentName: item.attachmentName,
        attachmentUrl: item.attachmentUrl,
        attachmentMimeType: item.attachmentMimeType,
        attachmentSize: item.attachmentSize,
        attemptNumber: item.attemptNumber,
        status: item.status,
        marksObtained: item.marksObtained,
        maxMarks: item.maxMarks,
        teacherFeedback: item.teacherFeedback,
        reviewedAt: item.reviewedAt,
        createdAt: item.createdAt,
      }))
    )
  );
}
