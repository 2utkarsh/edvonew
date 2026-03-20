import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, parseJson } from '@/lib/http';
import { slugify } from '@/lib/query';
import { ExamCategoryModel } from '@/models/ExamCategory';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const { id } = await params;
    const item = await ExamCategoryModel.findById(id).lean();
    if (!item) return fail('Exam category not found', 404);
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
    const update = { ...body, ...(body.title ? { slug: body.slug || slugify(String(body.title)) } : {}) };
    const item = await ExamCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return fail('Exam category not found', 404);
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
    const item = await ExamCategoryModel.findByIdAndDelete(id).lean();
    if (!item) return fail('Exam category not found', 404);
    return ok({ deleted: true, id });
  } catch (error) {
    return handleError(error);
  }
}
