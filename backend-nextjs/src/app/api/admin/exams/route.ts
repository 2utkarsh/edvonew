import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, parseJson } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ExamModel } from '@/models/Exam';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await ExamModel.find().sort({ updatedAt: -1 }).lean();
    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const body = await parseJson<Record<string, unknown>>(request);
    const title = String(body.title || 'Untitled Exam');
    const payload = { ...body, title, slug: body.slug || slugify(title) };
    const item = await ExamModel.create(payload);
    return created(item);
  } catch (error) {
    return handleError(error);
  }
}

