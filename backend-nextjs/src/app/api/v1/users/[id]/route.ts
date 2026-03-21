import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAuthPayload } from '@/lib/auth';
import { success, fail, notFound, forbidden } from '@/lib/http';
import { UserModel } from '@/models/User';
import { updateUserProfileSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET user by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await getAuthPayload();
    if (!authResult) {
      return fail('Unauthorized', 'UNAUTHORIZED', undefined, 401);
    }

    const { id } = await params;

    const user = await UserModel.findById(id)
      .select('-passwordHash')
      .populate('enrolledCourses', 'title thumbnail price rating')
      .populate('createdCourses', 'title thumbnail price rating studentsEnrolled')
      .lean();

    if (!user) {
      return notFound('User');
    }

    // Users can only view their own profile or public profiles
    if (user._id.toString() !== authResult.sub && authResult.role !== 'admin') {
      // Return limited public profile
      return success(
        {
          user: {
            id: user._id.toString(),
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
            headline: user.headline,
            skills: user.skills,
            role: user.role,
          },
        },
        'User profile retrieved successfully'
      );
    }

    return success(
      {
        user: {
          ...user.toObject(),
          id: user._id.toString(),
        },
      },
      'User profile retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get user error:', error);
    return fail(
      error.message || 'Failed to fetch user',
      'FETCH_USER_FAILED',
      undefined,
      500
    );
  }
}

// PUT update user by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await getAuthPayload();
    if (!authResult) {
      return fail('Unauthorized', 'UNAUTHORIZED', undefined, 401);
    }

    const { id } = await params;

    // Users can only update their own profile
    if (id !== authResult.sub && authResult.role !== 'admin') {
      return forbidden('You can only update your own profile');
    }

    const validation = await validateRequest(request, updateUserProfileSchema);
    if (validation.error) return validation.error;
    if (!validation.data) return fail('Request body is required', 'INVALID_REQUEST', undefined, 400);

    const updateData = validation.data;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return notFound('User');
    }

    return success(
      {
        user: {
          ...updatedUser.toObject(),
          id: updatedUser._id.toString(),
        },
      },
      'Profile updated successfully'
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    return fail(
      error.message || 'Failed to update user',
      'UPDATE_USER_FAILED',
      undefined,
      500
    );
  }
}

// DELETE user by ID (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await getAuthPayload();
    if (!authResult || authResult.role !== 'admin') {
      return forbidden('Admin access required');
    }

    const { id } = await params;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return notFound('User');
    }

    return success(
      { id },
      'User deleted successfully'
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return fail(
      error.message || 'Failed to delete user',
      'DELETE_USER_FAILED',
      undefined,
      500
    );
  }
}
