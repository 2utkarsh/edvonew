import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound, forbidden } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { UserModel } from '@/models/User';
import { updateCourseSchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single course by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const course = await CourseModel.findOne({ _id: id })
      .populate('instructorId', 'name email avatar bio headline')
      .lean();

    if (!course) {
      return notFound('Course');
    }

    return success(
      {
        course: {
          ...course.toObject(),
          id: course._id.toString(),
        },
      },
      'Course retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get course error:', error);
    return fail(
      error.message || 'Failed to fetch course',
      'FETCH_COURSE_FAILED',
      undefined,
      500
    );
  }
}

// PUT update course by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor', 'admin']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const userRole = authResult.payload.role;

    const { id } = await params;

    // Find course
    const course = await CourseModel.findById(id);
    if (!course) {
      return notFound('Course');
    }

    // Check permissions (only instructor or admin can update)
    if (
      userRole !== 'admin' &&
      course.instructorId?.toString() !== userId
    ) {
      return forbidden('You can only update your own courses');
    }

    // Validate request body
    const validation = await validateRequest(request, updateCourseSchema);
    if (validation.error) return validation.error;
    if (!validation.data) return fail('Request body is required', 'INVALID_REQUEST', undefined, 400);

    const updateData = validation.data;

    // Update course
    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    return success(
      {
        course: {
          ...updatedCourse!.toObject(),
          id: updatedCourse!._id.toString(),
        },
      },
      'Course updated successfully'
    );
  } catch (error: any) {
    console.error('Update course error:', error);
    return fail(
      error.message || 'Failed to update course',
      'UPDATE_COURSE_FAILED',
      undefined,
      500
    );
  }
}

// DELETE course by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['instructor', 'admin']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const userRole = authResult.payload.role;

    const { id } = await params;

    // Find course
    const course = await CourseModel.findById(id);
    if (!course) {
      return notFound('Course');
    }

    // Check permissions
    if (
      userRole !== 'admin' &&
      course.instructorId?.toString() !== userId
    ) {
      return forbidden('You can only delete your own courses');
    }

    // Delete course
    await CourseModel.findByIdAndDelete(id);

    // Remove from instructor's created courses
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { createdCourses: id },
    });

    return success(
      { id },
      'Course deleted successfully'
    );
  } catch (error: any) {
    console.error('Delete course error:', error);
    return fail(
      error.message || 'Failed to delete course',
      'DELETE_COURSE_FAILED',
      undefined,
      500
    );
  }
}
