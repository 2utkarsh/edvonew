import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { created, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseCategoryModel } from '@/models/CourseCategory';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const items = await CourseCategoryModel.find().sort({ order: 1, updatedAt: -1 }).lean();
    return toResponse(ok(items.map((item) => ({ ...item, id: String(item._id) }))));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();

    const body = await request.json();
    const name = String((body as any)?.name || (body as any)?.title || 'Untitled Category').trim();
    const slug = String((body as any)?.slug || slugify(name));

    const item = await CourseCategoryModel.create({
      name,
      slug,
      description: String((body as any)?.description || ''),
      icon: String((body as any)?.icon || ''),
      color: String((body as any)?.color || '#c17017'),
      order: Number((body as any)?.order || 0),
      isActive: (body as any)?.isActive === undefined ? true : Boolean((body as any)?.isActive),
      courseCount: Number((body as any)?.courseCount || 0),
    });

    return toResponse(created({ ...item.toObject(), id: String(item._id) }));
  } catch (error) {
    return handleError(error);
  }
}
