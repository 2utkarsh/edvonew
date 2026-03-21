import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { NotificationModel } from '@/models/Notification';

// GET user notifications
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth();
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';

    const filterQuery: any = { userId };
    if (unreadOnly) {
      filterQuery.isRead = false;
    }

    const total = await NotificationModel.countDocuments(filterQuery);

    const notifications = await NotificationModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return success(
      {
        notifications: notifications.map((n: any) => ({
          ...n.toObject(),
          id: n._id.toString(),
        })),
      },
      'Notifications retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return fail(
      error.message || 'Failed to fetch notifications',
      'FETCH_NOTIFICATIONS_FAILED',
      undefined,
      500
    );
  }
}
