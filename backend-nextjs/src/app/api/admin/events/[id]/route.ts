import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { mapEventDocumentToPublicEvent } from '@/lib/event-data';
import { deleteSyncedPublicEvent, syncEventItemToPublicEvent } from '@/lib/event-sync';
import { slugify } from '@/lib/query';
import { EventItemModel } from '@/models/EventItem';

function parseSpeakers(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((speaker) => ({ name: String((speaker as any)?.name || '').trim(), role: String((speaker as any)?.role || '').trim(), avatar: String((speaker as any)?.avatar || '/images/edvo-official-logo-v10.png') })).filter((speaker) => speaker.name);
  }

  return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split('|').map((part) => part.trim());
    return { name: parts[0] || 'Speaker', role: parts[1] || '', avatar: parts[2] || '/images/edvo-official-logo-v10.png' };
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const existing = await EventItemModel.findById(id).lean();
  if (!existing) return toResponse(fail('Event not found', 'NOT_FOUND', undefined, 404));

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};

  if (body.type && ['webinar', 'workshop', 'hackathon'].includes(String(body.type))) update.type = String(body.type);
  if (body.title) {
    update.title = String(body.title);
    update.slug = String(body.slug || slugify(`${String(body.type || existing.type)}-${String(body.title)}`));
  }
  if (body.description !== undefined) update.description = String(body.description || '');
  if (body.category !== undefined) update.category = String(body.category || 'General');
  if (body.image) update.image = String(body.image);
  if (body.date !== undefined) update.date = String(body.date || '');
  if (body.time !== undefined) update.time = String(body.time || '');
  if (body.location !== undefined) update.location = String(body.location || '');
  if (body.liveUrl !== undefined) update.liveUrl = body.liveUrl ? String(body.liveUrl) : undefined;
  if (body.status) update.status = ['Live', 'Ended'].includes(String(body.status)) ? body.status : 'Upcoming';
  if (body.visibility) update.visibility = body.visibility === 'inactive' ? 'inactive' : 'active';
  if (body.order !== undefined) update.order = parseInt(String(body.order), 10) || 0;
  if (body.speakers !== undefined) update.speakers = parseSpeakers(body.speakers);
  if (body.prizes !== undefined) update.prizes = body.prizes ? String(body.prizes) : undefined;
  if (body.duration !== undefined) update.duration = body.duration ? String(body.duration) : undefined;

  const item = await EventItemModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!item) return toResponse(fail('Event not found', 'NOT_FOUND', undefined, 404));

  await syncEventItemToPublicEvent(item, existing.slug);

  return toResponse(ok(mapEventDocumentToPublicEvent(item)));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await EventItemModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Event not found', 'NOT_FOUND', undefined, 404));

  await deleteSyncedPublicEvent(item.slug);

  return toResponse(ok({ deleted: true, id }));
}
