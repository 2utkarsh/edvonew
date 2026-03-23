import { connectToDatabase } from '@/lib/db';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { HiringPartnerApplicationModel } from '@/models/HiringPartnerApplication';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const item = await HiringPartnerApplicationModel.findByIdAndUpdate(
    id,
    {
      ...body,
      ...(body.status ? { status: String(body.status) } : {}),
    },
    { new: true }
  ).lean();

  if (!item) return toResponse(fail('Application not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(item));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const { id } = await params;
  const item = await HiringPartnerApplicationModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Application not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
