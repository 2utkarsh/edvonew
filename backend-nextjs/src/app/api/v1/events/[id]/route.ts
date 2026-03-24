import { NextRequest } from 'next/server';
import { getFallbackEventById } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { getAuthPayload } from '@/lib/auth';
import { fail, success, toResponse } from '@/lib/http';
import { EventModel } from '@/models/Event';
import { EventRegistrationModel } from '@/models/EventRegistration';
import { syncEventItemByIdToPublicEvent } from '@/lib/event-sync';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = await params;
    const authPayload = await getAuthPayload();

    if (!hasConfiguredMongoUri()) {
      const fallbackEvent = getFallbackEventById(id);
      if (!fallbackEvent) {
        return toResponse(fail('Event not found', 'EVENT_NOT_FOUND', undefined, 404));
      }

      return toResponse(success({
        event: {
          ...fallbackEvent,
          _id: fallbackEvent.id,
          isLive: fallbackEvent.status === 'Live',
          isUpcoming: fallbackEvent.status === 'Upcoming',
        },
        registration: null,
        viewerRole: authPayload?.role || null,
      }));
    }

    await connectToDatabase();

    let event = await EventModel.findById(id).lean();
    if (!event) {
      event = await syncEventItemByIdToPublicEvent(id);
    }
    if (!event) {
      return toResponse(fail('Event not found', 'EVENT_NOT_FOUND', undefined, 404));
    }

    let registration: any = null;

    if (authPayload?.role === 'student') {
      registration = await EventRegistrationModel.findOne({
        eventId: event._id,
        userId: authPayload.sub,
      }).lean();
    }

    return toResponse(success({
      event: {
        ...event,
        id: String(event._id),
        _id: String(event._id),
        isLive: event.status === 'live',
        isUpcoming: new Date(event.scheduledAt) > new Date(),
      },
      registration: registration
        ? {
            id: String(registration._id),
            status: registration.status,
            registeredAt: registration.registeredAt,
            joinedAt: registration.joinedAt,
          }
        : null,
      viewerRole: authPayload?.role || null,
    }));
  } catch (error: any) {
    console.error('Get event error:', error);
    return toResponse(fail(
      error.message || 'Failed to load event',
      'GET_EVENT_FAILED',
      undefined,
      500
    ));
  }
}
