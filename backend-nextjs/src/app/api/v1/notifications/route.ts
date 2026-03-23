import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { success, fail, toResponse } from '@/lib/http';
import { NotificationModel } from '@/models/Notification';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if ('error' in auth) return auth.error;

    const userId = auth.payload.sub;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
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

    return toResponse(success(
      {
        notifications: notifications.map((notification: any) => ({
          ...notification,
          id: String(notification._id),
        })),
      },
      'Notifications retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    ));
  } catch (error: any) {
    return toResponse(fail(error?.message || 'Failed to fetch notifications', 'FETCH_NOTIFICATIONS_FAILED', undefined, 500));
  }
}
