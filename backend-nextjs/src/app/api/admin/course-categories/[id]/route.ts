import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { fail, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseCategoryModel } from '@/models/CourseCategory';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const { id } = await params;
    const item = await CourseCategoryModel.findById(id).lean();
    if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok({ ...item, id: String(item._id) }));
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
    const body = await request.json();
    const name = (body as any)?.name || (body as any)?.title;

    const update = {
      ...(name ? { name: String(name).trim() } : {}),
      ...((body as any)?.slug ? { slug: String((body as any).slug) } : name ? { slug: slugify(String(name)) } : {}),
      ...((body as any)?.description !== undefined ? { description: String((body as any).description || '') } : {}),
      ...((body as any)?.icon !== undefined ? { icon: String((body as any).icon || '') } : {}),
      ...((body as any)?.color !== undefined ? { color: String((body as any).color || '#c17017') } : {}),
      ...((body as any)?.order !== undefined ? { order: Number((body as any).order || 0) } : {}),
      ...((body as any)?.isActive !== undefined ? { isActive: Boolean((body as any).isActive) } : {}),
    };

    const item = await CourseCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok({ ...item, id: String(item._id) }));
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
    const item = await CourseCategoryModel.findByIdAndDelete(id).lean();
    if (!item) return toResponse(fail('Course category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok({ deleted: true, id }));
  } catch (error) {
    return handleError(error);
  }
}
