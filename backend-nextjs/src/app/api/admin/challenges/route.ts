import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { buildDefaultChallengeQuestions, mapChallengeDocumentToPublicChallenge } from '@/lib/challenge-data';
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
    .map((question: any) => ({
      prompt: String(question?.prompt || '').trim(),
      type: String(question?.type || 'textarea').trim() || 'textarea',
      options: Array.isArray(question?.options) ? question.options.map((option: unknown) => String(option || '').trim()).filter(Boolean) : [],
      required: question?.required === false ? false : true,
      placeholder: String(question?.placeholder || '').trim(),
    }))
    .filter((question) => question.prompt);
}

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const items = await ChallengeItemModel.find().sort({ phase: 1, order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapChallengeDocumentToPublicChallenge)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const title = String(body.title || '').trim();
  if (!title) return toResponse(fail('Title is required', 'VALIDATION_ERROR', undefined, 400));

  const slug = String(body.slug || slugify(title));
  const href = String(body.href || `/challenges/${slug}`);
  const phase = body.phase === 'completed' ? 'completed' : 'ongoing';

  const item = await ChallengeItemModel.create({
    title,
    slug,
    description: String(body.description || ''),
    image: String(body.image || '/images/edvo-official-logo-v10.png'),
    category: String(body.category || 'General'),
    phase,
    visibility: body.visibility === 'inactive' ? 'inactive' : 'active',
    order: parseInt(String(body.order || 0), 10) || 0,
    prize: String(body.prize || ''),
    participants: String(body.participants || ''),
    href,
    badge: body.badge ? String(body.badge) : undefined,
    objective: String(body.objective || body.description || ''),
    duration: String(body.duration || (phase === 'completed' ? 'Self-paced practice' : '7 days')),
    difficulty: String(body.difficulty || 'Intermediate'),
    tools: parseList(body.tools),
    deliverables: parseList(body.deliverables),
    steps: parseList(body.steps),
    actionUrl: String(body.actionUrl || ''),
    startDate: String(body.startDate || ''),
    startTime: String(body.startTime || ''),
    endDate: String(body.endDate || ''),
    endTime: String(body.endTime || ''),
    registrationDeadline: String(body.registrationDeadline || ''),
    expiryDate: String(body.expiryDate || ''),
    competitionMode: String(body.competitionMode || 'Individual'),
    maxSubmissions: Math.max(1, parseInt(String(body.maxSubmissions || 1), 10) || 1),
    teamSize: String(body.teamSize || 'Solo or small team'),
    statusNote: String(body.statusNote || ''),
    eligibility: parseList(body.eligibility),
    rules: parseList(body.rules),
    questions: (() => { const parsedQuestions = parseQuestions(body.questions); return parsedQuestions.length ? parsedQuestions : buildDefaultChallengeQuestions({ title, description: String(body.description || ''), category: String(body.category || 'General'), phase, objective: String(body.objective || body.description || ''), deliverables: parseList(body.deliverables), tools: parseList(body.tools) }); })(),
  });

  return toResponse(created(mapChallengeDocumentToPublicChallenge(item)));
}

