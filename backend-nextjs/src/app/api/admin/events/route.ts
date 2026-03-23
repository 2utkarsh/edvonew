import { connectToDatabase } from '@/lib/db';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { created, fail, ok, parseJson, toResponse } from '@/lib/http';
import { mapEventDocumentToPublicEvent } from '@/lib/event-data';
import { syncEventItemToPublicEvent } from '@/lib/event-sync';
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

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query: Record<string, unknown> = {};
  if (type && ['webinar', 'workshop', 'hackathon'].includes(type)) query.type = type;

  const items = await EventItemModel.find(query).sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map(mapEventDocumentToPublicEvent)));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const type = String(body.type || 'webinar');
  const title = String(body.title || '').trim();
  if (!title) return toResponse(fail('Title is required', 'VALIDATION_ERROR', undefined, 400));
  if (!['webinar', 'workshop', 'hackathon'].includes(type)) return toResponse(fail('Valid event type is required', 'VALIDATION_ERROR', undefined, 400));

  const item = await EventItemModel.create({
    type,
    title,
    slug: String(body.slug || slugify(`${type}-${title}`)),
    description: String(body.description || ''),
    category: String(body.category || 'General'),
    image: String(body.image || '/images/edvo-official-logo-v10.png'),
    date: String(body.date || ''),
    time: String(body.time || ''),
    location: String(body.location || ''),
    liveUrl: body.liveUrl ? String(body.liveUrl) : undefined,
    status: ['Live', 'Ended'].includes(String(body.status)) ? body.status : 'Upcoming',
    visibility: body.visibility === 'inactive' ? 'inactive' : 'active',
    order: parseInt(String(body.order || 0), 10) || 0,
    speakers: parseSpeakers(body.speakers),
    prizes: body.prizes ? String(body.prizes) : undefined,
    duration: body.duration ? String(body.duration) : undefined,
  });

  await syncEventItemToPublicEvent(item.toObject());

  return toResponse(created(mapEventDocumentToPublicEvent(item)));
}
