import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { TeamMemberModel } from '@/models/TeamMember';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { mapTeamMemberToPublicTeamMember } from '@/lib/team-data';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};

  if (body.name) update.name = String(body.name);
  if (body.title) update.title = String(body.title);
  if (body.bio) update.bio = String(body.bio);
  if (body.image) update.image = String(body.image);
  if (body.status) update.status = String(body.status);

  const item = await TeamMemberModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Team member not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok(mapTeamMemberToPublicTeamMember(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await TeamMemberModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Team member not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
