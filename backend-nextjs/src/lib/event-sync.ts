import { getAuthPayload } from '@/lib/auth';
import { EventItemDocument, EventItemModel, EventType } from '@/models/EventItem';
import { EventModel } from '@/models/Event';
import { EventRegistrationModel } from '@/models/EventRegistration';
import { UserModel } from '@/models/User';

function parseScheduledAt(date: string, time: string): Date {
  const direct = new Date(`${date} ${time}`);
  if (!Number.isNaN(direct.getTime())) return direct;

  const fallback = new Date(date);
  if (!Number.isNaN(fallback.getTime())) return fallback;

  return new Date();
}

function parseDurationMinutes(item: Pick<EventItemDocument, 'duration' | 'time'>): number {
  const source = `${item.duration || ''} ${item.time || ''}`;
  const value = parseInt(source, 10);
  if (!Number.isFinite(value) || value <= 0) return 60;

  return /hour/i.test(source) ? value * 60 : value;
}

function mapLifecycleToStatus(status: string, visibility: string): 'draft' | 'published' | 'live' | 'ended' {
  if (visibility === 'inactive') return 'draft';
  if (status === 'Live') return 'live';
  if (status === 'Ended') return 'ended';
  return 'published';
}

function inferLiveUrl(location: string): string | undefined {
  const value = String(location || '').trim();
  return /^https?:\/\//i.test(value) ? value : undefined;
}

async function resolveOwner() {
  const auth = await getAuthPayload();
  if (auth?.sub) {
    return {
      instructorId: auth.sub,
      instructorName: auth.name || 'EDVO Team',
    };
  }

  const fallback = await UserModel.findOne({ role: { $in: ['admin', 'instructor'] } }).sort({ createdAt: 1 }).lean();
  return {
    instructorId: String(fallback?._id || ''),
    instructorName: String(fallback?.name || 'EDVO Team'),
  };
}

export async function syncEventItemToPublicEvent(item: EventItemDocument & { _id?: unknown }, previousSlug?: string) {
  const owner = await resolveOwner();
  const filter = previousSlug ? { $or: [{ slug: item.slug }, { slug: previousSlug }] } : { slug: item.slug };
  const existing = await EventModel.findOne(filter).lean();

  const publicEvent = await EventModel.findOneAndUpdate(
    filter,
    {
      title: item.title,
      slug: item.slug,
      type: item.type,
      description: item.description,
      instructorId: existing?.instructorId || owner.instructorId,
      instructorName: existing?.instructorName || owner.instructorName,
      thumbnail: item.image,
      banner: item.image,
      scheduledAt: parseScheduledAt(item.date, item.time),
      duration: parseDurationMinutes(item),
      maxParticipants: existing?.maxParticipants || 100,
      registeredCount: existing?.registeredCount || 0,
      status: mapLifecycleToStatus(item.status, item.visibility),
      liveUrl: inferLiveUrl(item.location) || existing?.liveUrl,
      recordingUrl: existing?.recordingUrl,
      resources: existing?.resources || [],
      requirements: existing?.requirements || [],
      tags: [item.category].filter(Boolean),
      price: existing?.price || 0,
      isPaid: existing?.isPaid || false,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return publicEvent;
}

export async function syncExistingEventItemsToPublicEvents(type?: EventType) {
  const query: Record<string, unknown> = { visibility: 'active' };
  if (type) query.type = type;

  const items = await EventItemModel.find(query).sort({ order: 1, updatedAt: -1 }).lean();
  const synced = [];
  for (const item of items) {
    const publicEvent = await syncEventItemToPublicEvent(item);
    if (publicEvent) synced.push(publicEvent);
  }
  return synced;
}

export async function syncEventItemByIdToPublicEvent(id: string) {
  const item = await EventItemModel.findById(id).lean();
  if (!item || item.visibility === 'inactive') return null;
  return syncEventItemToPublicEvent(item);
}

export async function deleteSyncedPublicEvent(slug: string) {
  const event = await EventModel.findOneAndDelete({ slug }).lean();
  if (event?._id) {
    await EventRegistrationModel.deleteMany({ eventId: event._id });
  }
}
