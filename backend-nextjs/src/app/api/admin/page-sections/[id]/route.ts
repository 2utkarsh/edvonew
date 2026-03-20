import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, parseJson } from '@/lib/http';
import { slugify } from '@/lib/query';
import { PageSectionModel } from '@/models/PageSection';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const item = await PageSectionModel.findById(id).lean();
    if (!item) return fail('Page section not found', 404);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const body = await parseJson<Record<string, unknown>>(request);
    const update = { ...body, ...(body.name ? { slug: body.slug || slugify(String(body.name)) } : {}) };
    const item = await PageSectionModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return fail('Page section not found', 404);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const item = await PageSectionModel.findByIdAndDelete(id).lean();
    if (!item) return fail('Page section not found', 404);
    return ok({ deleted: true, id });
  } catch (error) {
    return handleError(error);
  }
}
