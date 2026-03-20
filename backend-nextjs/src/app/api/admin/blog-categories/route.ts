import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, parseJson } from '@/lib/http';
import { slugify } from '@/lib/query';
import { BlogCategoryModel, BlogModel } from '@/models/Blog';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await BlogCategoryModel.find().sort({ sort: 1, updatedAt: -1 }).lean();
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
    const name = String(body.name || 'Untitled Blog Category');
    const item = await BlogCategoryModel.create({ ...body, name, slug: body.slug || slugify(name) });
    return created(item);
  } catch (error) {
    return handleError(error);
  }
}
