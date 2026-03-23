import { connectToDatabase } from '@/lib/db';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { ok, parseJson, toResponse } from '@/lib/http';
import { HiringPartnerApplicationModel } from '@/models/HiringPartnerApplication';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const items = await HiringPartnerApplicationModel.find().sort({ createdAt: -1 }).lean();
  return toResponse(ok(items));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const item = await HiringPartnerApplicationModel.create({
    companyName: String(body.companyName || ''),
    contactName: String(body.contactName || ''),
    workEmail: String(body.workEmail || ''),
    phone: String(body.phone || '') || undefined,
    website: String(body.website || '') || undefined,
    hiringNeeds: String(body.hiringNeeds || '') || undefined,
    roles: String(body.roles || '') || undefined,
    companySize: String(body.companySize || '') || undefined,
    message: String(body.message || '') || undefined,
    status: ['reviewed', 'contacted', 'archived'].includes(String(body.status)) ? String(body.status) : 'new',
    notes: String(body.notes || '') || undefined,
  });
  return toResponse(ok(item));
}
