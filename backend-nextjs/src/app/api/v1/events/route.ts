import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { EventModel } from '@/models/Event';
import { buildPagination } from '@/lib/pagination';

// GET all events with filters
export async function GET(request: NextRequest): Promise<Response> {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // webinar, workshop, hackathon
    const status = searchParams.get('status') || 'published';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filterQuery: any = {};
    
    if (status && status !== 'all') {
      filterQuery.status = status;
    }

    if (type) {
      filterQuery.type = type;
    }

    const total = await EventModel.countDocuments(filterQuery);

    const events = await EventModel.find(filterQuery)
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const meta = buildPagination({ page, limit }, total);

    return toResponse(success(
      {
        events: events.map((e: any) => ({
          ...e.toObject(),
          id: e._id.toString(),
          isLive: e.status === 'live',
          isUpcoming: new Date(e.scheduledAt) > new Date(),
        })),
      },
      'Events retrieved successfully',
      meta
    ));
  } catch (error: any) {
    console.error('Get events error:', error);
    // Return empty array instead of error
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
    if (authResult.error) return toResponse(authResult.error);

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
    } = body;

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingEvent = await EventModel.findOne({ slug });
    if (existingEvent) {
      return toResponse(fail('An event with this title already exists', 'SLUG_EXISTS', undefined, 409));
    }

    // Get instructor name
    const { UserModel } = await import('@/models/User');
    const user = await UserModel.findById(userId);
    if (!user) {
      return toResponse(fail('User not found', 'USER_NOT_FOUND', undefined, 404));
    }

    // Create event
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
      status: 'draft',
      registeredCount: 0,
      tags: tags || [],
      requirements: requirements || [],
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
