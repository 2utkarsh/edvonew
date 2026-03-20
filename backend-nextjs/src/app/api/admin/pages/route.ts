import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, parseJson } from '@/lib/http';
import { slugify } from '@/lib/query';
import { PageModel } from '@/models/Page';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const items = await PageModel.find().sort({ updatedAt: -1 }).lean();
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
    const title = String(body.title || 'Untitled Page');
    const item = await PageModel.create({
      ...body,
      name: String(body.name || title),
      title,
      slug: body.slug || slugify(title),
    });
    return created(item);
  } catch (error) {
    return handleError(error);
  }
}
