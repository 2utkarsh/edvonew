import { connectToDatabase } from '@/lib/db';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ensureHomeContent } from '@/lib/home-content-store';
import { ok, parseJson, toResponse } from '@/lib/http';
import { HomeContentModel } from '@/models/HomeContent';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureHomeContent();
  const item = await HomeContentModel.findOne({ key: 'home' }).lean();
  return toResponse(ok(item || {}));
}

export async function PATCH(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureHomeContent();
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const item = await HomeContentModel.findOneAndUpdate({ key: 'home' }, { $set: { ...body, key: 'home' } }, { new: true, upsert: true }).lean();
  return toResponse(ok(item));
}
