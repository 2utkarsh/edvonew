import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { ChallengeItemModel } from '@/models/ChallengeItem';
import { ChallengeSubmissionModel } from '@/models/ChallengeSubmission';

type SubmissionAttachment = {
  name?: unknown;
  url?: unknown;
  mimeType?: unknown;
  size?: unknown;
};

function normalizeAttachment(value: unknown) {
  const attachment = value && typeof value === 'object' ? (value as SubmissionAttachment) : {};
  return {
    name: String(attachment.name || '').trim(),
    url: String(attachment.url || '').trim(),
    mimeType: String(attachment.mimeType || '').trim(),
    size: Math.max(0, parseInt(String(attachment.size || 0), 10) || 0),
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!hasConfiguredMongoUri()) {
    return toResponse(fail('Challenge submissions require a configured database', 'SERVICE_UNAVAILABLE', undefined, 503));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const { slug } = await params;
  const challenge = await ChallengeItemModel.findOne({ slug }).lean();
  if (!challenge) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const studentName = String(body.studentName || '').trim();
  const studentEmail = String(body.studentEmail || '').trim().toLowerCase();
  const answerText = String(body.answerText || '').trim();
  const attachment = normalizeAttachment(body.attachment);

  if (!studentName) return toResponse(fail('Student name is required', 'VALIDATION_ERROR', undefined, 400));
  if (!studentEmail || !studentEmail.includes('@')) return toResponse(fail('A valid email is required', 'VALIDATION_ERROR', undefined, 400));
  if (!answerText && !attachment.url) {
    return toResponse(fail('Upload a document/PDF or add an answer note before submitting', 'VALIDATION_ERROR', undefined, 400));
  }

  const priorSubmissions = await ChallengeSubmissionModel.countDocuments({
    challengeSlug: slug,
    studentEmail,
  });

  const maxSubmissions = Math.max(1, Number(challenge.maxSubmissions || 1) || 1);
  if (priorSubmissions >= maxSubmissions) {
    return toResponse(fail(`You have already used all ${maxSubmissions} submission attempt(s) for this challenge`, 'CONFLICT', undefined, 409));
  }

  const item = await ChallengeSubmissionModel.create({
    challengeId: String(challenge._id || ''),
    challengeSlug: String(challenge.slug || slug),
    challengeTitle: String(challenge.title || 'Challenge'),
    studentName,
    studentEmail,
    answerText,
    attachmentName: attachment.name,
    attachmentUrl: attachment.url,
    attachmentMimeType: attachment.mimeType,
    attachmentSize: attachment.size,
    attemptNumber: priorSubmissions + 1,
    status: 'pending',
    marksObtained: null,
    maxMarks: Math.max(1, Number(challenge.projectMaxMarks || 100) || 100),
    teacherFeedback: '',
    reviewedAt: null,
  });

  return toResponse(
    created(
      {
        id: String(item._id || ''),
        status: item.status,
        attemptNumber: item.attemptNumber,
        maxMarks: item.maxMarks,
      },
      'Submission received successfully'
    )
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!hasConfiguredMongoUri()) {
    return toResponse(ok([]));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const { slug } = await params;
  const submissions = await ChallengeSubmissionModel.find({ challengeSlug: slug })
    .sort({ createdAt: -1 })
    .lean();

  return toResponse(
    ok(
      submissions.map((item) => ({
        id: String(item._id || ''),
        studentName: item.studentName,
        studentEmail: item.studentEmail,
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
