import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, toResponse } from '@/lib/http';
import { EventModel } from '@/models/Event';
import { EventRegistrationModel } from '@/models/EventRegistration';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST join live event
export async function POST(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student', 'instructor', 'admin']);
    if (authResult.error) return toResponse(authResult.error);

    const userId = authResult.payload.sub;
    const userRole = authResult.payload.role;
    const { id: eventId } = await params;

    // Verify event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      return toResponse(fail('Event not found', 'EVENT_NOT_FOUND', undefined, 404));
    }

    // Check if event is live
    if (event.status !== 'live') {
      return toResponse(fail('Event is not live yet', 'EVENT_NOT_LIVE', undefined, 400));
    }

    // For students, check if registered
    if (userRole === 'student') {
      const registration = await EventRegistrationModel.findOne({
        eventId,
        userId,
      });

      if (!registration) {
        return toResponse(fail('You must register before joining', 'NOT_REGISTERED', undefined, 403));
      }

      // Update registration to attended
      await EventRegistrationModel.findOneAndUpdate(
        { eventId, userId },
        {
          status: 'attended',
          joinedAt: new Date(),
        }
      );
    }

    // Return live URL
    return toResponse(success(
      {
        liveUrl: event.liveUrl || `https://meet.google.com/${event.slug}`,
        event: {
          title: event.title,
          type: event.type,
          instructorName: event.instructorName,
        },
      },
      'Joined live event successfully'
    ));
  } catch (error: any) {
    console.error('Join event error:', error);
    return toResponse(fail(
      error.message || 'Failed to join event',
      'JOIN_EVENT_FAILED',
      undefined,
      500
    ));
  }
}
