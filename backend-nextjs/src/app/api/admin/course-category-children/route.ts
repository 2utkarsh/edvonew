import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, parseJson } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseCategoryChildModel } from '@/models/CourseCategory';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await CourseCategoryChildModel.find().sort({ sort: 1, updatedAt: -1 }).lean();
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
    const title = String(body.title || 'Untitled Child Category');
    const item = await CourseCategoryChildModel.create({ ...body, title, slug: body.slug || slugify(title) });
    return created(item);
  } catch (error) {
    return handleError(error);
  }
}
