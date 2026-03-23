import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAuthPayload } from '@/lib/auth';
import { fail, success, toResponse } from '@/lib/http';
import { EventModel } from '@/models/Event';
import { EventRegistrationModel } from '@/models/EventRegistration';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    await connectToDatabase();

    const { id } = await params;
    const event = await EventModel.findById(id).lean();
    if (!event) {
      return toResponse(fail('Event not found', 'EVENT_NOT_FOUND', undefined, 404));
    }

    const authPayload = await getAuthPayload();
    let registration: any = null;

    if (authPayload?.role === 'student') {
      registration = await EventRegistrationModel.findOne({
        eventId: id,
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
