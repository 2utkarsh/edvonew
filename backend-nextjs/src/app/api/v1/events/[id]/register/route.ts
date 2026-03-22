import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, toResponse } from '@/lib/http';
import { EventModel } from '@/models/Event';
import { EventRegistrationModel } from '@/models/EventRegistration';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST register for event
export async function POST(request: NextRequest, { params }: RouteParams): Promise<Response> {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return toResponse(authResult.error);

    const userId = authResult.payload.sub;
    const { id: eventId } = await params;

    // Verify event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      return toResponse(fail('Event not found', 'EVENT_NOT_FOUND', undefined, 404));
    }

    // Check if event is published or live
    if (!['published', 'live'].includes(event.status)) {
      return toResponse(fail('Event registration is not open', 'REGISTRATION_CLOSED', undefined, 400));
    }

    // Check if already registered
    const existingRegistration = await EventRegistrationModel.findOne({
      eventId,
      userId,
    });

    if (existingRegistration) {
      return toResponse(success(
        {
          message: 'Already registered',
          registration: {
            id: existingRegistration._id.toString(),
            status: existingRegistration.status,
          },
        },
        'Already registered for this event'
      ));
    }

    // Check if event is full
    if (event.registeredCount >= event.maxParticipants) {
      return toResponse(fail('Event is full', 'EVENT_FULL', undefined, 400));
    }

    // Get user details
    const { UserModel } = await import('@/models/User');
    const user = await UserModel.findById(userId);
    if (!user) {
      return toResponse(fail('User not found', 'USER_NOT_FOUND', undefined, 404));
    }

    // Create registration
    const registration = await EventRegistrationModel.create({
      eventId,
      userId,
      userName: user.name,
      userEmail: user.email,
      status: 'registered',
    });

    // Update event registered count
    await EventModel.findByIdAndUpdate(eventId, {
      $inc: { registeredCount: 1 },
    });

    return toResponse(success(
      {
        registration: {
          id: registration._id.toString(),
          status: registration.status,
          event: {
            title: event.title,
            scheduledAt: event.scheduledAt,
          },
        },
      },
      'Successfully registered for event',
      { status: 201 }
    ));
  } catch (error: any) {
    console.error('Register event error:', error);
    return toResponse(fail(
      error.message || 'Failed to register for event',
      'REGISTER_EVENT_FAILED',
      undefined,
      500
    ));
  }
}
