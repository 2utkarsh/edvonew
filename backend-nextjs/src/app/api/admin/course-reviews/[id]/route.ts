import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ReviewModel } from '@/models/Review';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};

  if (body.isApproved !== undefined) update.isApproved = Boolean(body.isApproved);
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;

  const item = await ReviewModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Course review not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ id, updated: true }));
}
