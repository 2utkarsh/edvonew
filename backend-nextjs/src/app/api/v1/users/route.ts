import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, forbidden } from '@/lib/http';
import { UserModel } from '@/models/User';
import { paginationSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['admin']);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = paginationSchema.safeParse(queryParams);
    if (!validation.success) {
      return fail('Invalid query parameters', 'INVALID_QUERY', undefined, 400);
    }

    const { page, limit, search, sort, order } = validation.data;

    const filterQuery: any = {};
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await UserModel.countDocuments(filterQuery);

    const users = await UserModel.find(filterQuery)
      .sort({ [sort || 'createdAt']: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-passwordHash')
      .lean();

    return success(
      { users },
      'Users retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error: any) {
    console.error('Get users error:', error);
    return fail(
      error.message || 'Failed to fetch users',
      'FETCH_USERS_FAILED',
      undefined,
      500
    );
  }
}
