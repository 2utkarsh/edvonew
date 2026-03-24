import { NextRequest } from 'next/server';
import { getFallbackEvents } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, toResponse } from '@/lib/http';
import { EventModel } from '@/models/Event';
import { buildPagination } from '@/lib/pagination';
import { syncExistingEventItemsToPublicEvents } from '@/lib/event-sync';

// GET all events with filters
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'webinar' | 'workshop' | 'hackathon' | null;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!hasConfiguredMongoUri()) {
      let items = getFallbackEvents(type || undefined);
      if (status === 'live') items = items.filter((item) => item.status === 'Live');
      if (status === 'ended') items = items.filter((item) => item.status === 'Ended');
      const total = items.length;
      const paged = items.slice((page - 1) * limit, (page - 1) * limit + limit);
      const meta = buildPagination({ page, limit }, total);
      return toResponse(success({
        events: paged.map((event) => ({
          ...event,
          _id: event.id,
          isLive: event.status === 'Live',
          isUpcoming: event.status === 'Upcoming',
        })),
      }, 'Events retrieved successfully', meta));
    }

    await connectToDatabase();

    const filterQuery: any = {};

    if (status && status !== 'all') {
      filterQuery.status = status;
    } else {
      filterQuery.status = { $in: ['published', 'live', 'ended'] };
    }

    if (type) {
      filterQuery.type = type;
    }

    let total = await EventModel.countDocuments(filterQuery);
    let events = await EventModel.find(filterQuery)
      .sort({ status: -1, scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (total === 0) {
      await syncExistingEventItemsToPublicEvents(type || undefined);
      total = await EventModel.countDocuments(filterQuery);
      events = await EventModel.find(filterQuery)
        .sort({ status: -1, scheduledAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    const meta = buildPagination({ page, limit }, total);

    return toResponse(success(
      {
        events: events.map((e: any) => ({
          ...e,
          id: String(e._id),
          _id: String(e._id),
          isLive: e.status === 'live',
          isUpcoming: new Date(e.scheduledAt) > new Date(),
        })),
      },
      'Events retrieved successfully',
      meta
    ));
  } catch (error: any) {
    console.error('Get events error:', error);
    return toResponse(success(
      { events: [] },
      'No events available',
      { page: 1, limit: 10, total: 0, totalPages: 0 }
    ));
  }
}

// POST create new event (instructor/admin only)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor', 'admin']);
    if ('error' in authResult) return toResponse(authResult.error);

    const userId = authResult.payload.sub;
    const body = await request.json();

    const {
      title,
      type,
      description,
      scheduledAt,
      duration,
      maxParticipants,
      price,
      isPaid,
      tags,
      requirements,
      liveUrl,
      thumbnail,
      banner,
      status: requestedStatus,
    } = body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingEvent = await EventModel.findOne({ slug });
    if (existingEvent) {
      return toResponse(fail('An event with this title already exists', 'SLUG_EXISTS', undefined, 409));
    }

    const { UserModel } = await import('@/models/User');
    const user = await UserModel.findById(userId);
    if (!user) {
      return toResponse(fail('User not found', 'USER_NOT_FOUND', undefined, 404));
    }

    const event = await EventModel.create({
      title,
      slug,
      type,
      description,
      instructorId: userId,
      instructorName: user.name,
      scheduledAt: new Date(scheduledAt),
      duration,
      maxParticipants: maxParticipants || 100,
      price: price || 0,
      isPaid: isPaid || false,
      status: ['published', 'live', 'ended', 'cancelled', 'draft'].includes(String(requestedStatus)) ? requestedStatus : 'draft',
      registeredCount: 0,
      tags: tags || [],
      requirements: requirements || [],
      liveUrl: liveUrl || undefined,
      thumbnail: thumbnail || undefined,
      banner: banner || undefined,
    });

    return toResponse(success(
      {
        event: {
          ...event.toObject(),
          id: event._id.toString(),
        },
      },
      'Event created successfully',
      { status: 201 }
    ));
  } catch (error: any) {
    console.error('Create event error:', error);
    return toResponse(fail(
      error.message || 'Failed to create event',
      'CREATE_EVENT_FAILED',
      undefined,
      500
    ));
  }
}
