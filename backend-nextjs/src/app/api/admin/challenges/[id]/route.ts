import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { buildDefaultChallengeQuestions, ensurePrizeDistribution, mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
import { slugify } from '@/lib/query';
import { ChallengeItemModel } from '@/models/ChallengeItem';

function parseList(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  return String(value || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function parseQuestions(value: unknown) {
  const source = Array.isArray(value) ? value : parseJson(String(value || '[]'));
  if (!Array.isArray(source)) return [];
  return source
    .map((question: any) => {
      const prompt = String(question?.prompt || '').trim();
      const options = Array.isArray(question?.options)
        ? question.options.map((option: unknown) => String(option || '').trim()).filter(Boolean)
        : [];
      const correctAnswer = String(question?.correctAnswer || '').trim();
      if (!prompt || options.length < 2 || !correctAnswer || !options.includes(correctAnswer)) return null;
      return {
        prompt,
        options,
        correctAnswer,
        explanation: String(question?.explanation || '').trim(),
        points: Math.max(1, parseInt(String(question?.points || 1), 10) || 1),
      };
    })
    .filter(Boolean);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};
  if (body.title) {
    update.title = String(body.title);
    update.slug = String(body.slug || slugify(String(body.title)));
  }
  if (body.description !== undefined) update.description = String(body.description || '');
  if (body.image) update.image = String(body.image);
  if (body.category !== undefined) update.category = String(body.category || 'General');
  if (body.phase !== undefined) update.phase = body.phase === 'completed' ? 'completed' : 'ongoing';
  if (body.visibility !== undefined) update.visibility = body.visibility === 'inactive' ? 'inactive' : 'active';
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;
  if (body.prize !== undefined) update.prize = String(body.prize || '');
  if (body.participants !== undefined) update.participants = String(body.participants || '');
  if (body.href !== undefined) update.href = String(body.href || '');
  if (body.badge !== undefined) update.badge = body.badge ? String(body.badge) : undefined;
  if (body.objective !== undefined) update.objective = String(body.objective || '');
  if (body.duration !== undefined) update.duration = String(body.duration || '');
  if (body.difficulty !== undefined) update.difficulty = String(body.difficulty || 'Intermediate');
  const parsedTools = body.tools !== undefined ? parseList(body.tools) : undefined;
  const parsedDeliverables = body.deliverables !== undefined ? parseList(body.deliverables) : undefined;
  const parsedPrizeDistribution = body.prizeDistribution !== undefined ? parseList(body.prizeDistribution) : undefined;
  if (parsedTools !== undefined) update.tools = parsedTools;
  if (parsedDeliverables !== undefined) update.deliverables = parsedDeliverables;
  if (body.steps !== undefined) update.steps = parseList(body.steps);
  if (body.actionUrl !== undefined) update.actionUrl = String(body.actionUrl || '');
  if (body.startDate !== undefined) update.startDate = String(body.startDate || '');
  if (body.startTime !== undefined) update.startTime = String(body.startTime || '');
  if (body.endDate !== undefined) update.endDate = String(body.endDate || '');
  if (body.endTime !== undefined) update.endTime = String(body.endTime || '');
  if (body.registrationDeadline !== undefined) update.registrationDeadline = String(body.registrationDeadline || '');
  if (body.expiryDate !== undefined) update.expiryDate = String(body.expiryDate || '');
  if (body.competitionMode !== undefined) update.competitionMode = String(body.competitionMode || 'Individual');
  if (body.maxSubmissions !== undefined) update.maxSubmissions = Math.max(1, parseInt(String(body.maxSubmissions), 10) || 1);
  if (body.teamSize !== undefined) update.teamSize = String(body.teamSize || 'Solo or small team');
  if (body.statusNote !== undefined) update.statusNote = String(body.statusNote || '');
  if (body.eligibility !== undefined) update.eligibility = parseList(body.eligibility);
  if (body.rules !== undefined) update.rules = parseList(body.rules);
  if (body.quizDurationMinutes !== undefined) update.quizDurationMinutes = Math.max(1, parseInt(String(body.quizDurationMinutes), 10) || 45);
  if (parsedPrizeDistribution !== undefined) update.prizeDistribution = parsedPrizeDistribution.length ? parsedPrizeDistribution : ensurePrizeDistribution({ prize: String(body.prize || '') });
  if (body.questions !== undefined) {
    const parsedQuestions = parseQuestions(body.questions);
    update.questions = parsedQuestions.length
      ? parsedQuestions
      : buildDefaultChallengeQuestions({
          title: String(body.title || ''),
          description: String(body.description || ''),
          category: String(body.category || 'General'),
          phase: body.phase === 'completed' ? 'completed' : 'ongoing',
          objective: String(body.objective || body.description || ''),
          deliverables: parsedDeliverables || [],
          tools: parsedTools || [],
        });
  }

  const item = await ChallengeItemModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapChallengeDocumentToPublicChallenge(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await ChallengeItemModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Challenge not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
