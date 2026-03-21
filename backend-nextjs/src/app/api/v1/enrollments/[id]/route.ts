import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { EnrollmentModel } from '@/models/Enrollment';
import { CourseModel } from '@/models/Course';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single enrollment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id } = await params;

    const enrollment = await EnrollmentModel.findOne({ _id: id, userId })
      .populate('courseId')
      .lean();

    if (!enrollment) {
      return notFound('Enrollment');
    }

    return success(
      {
        enrollment: {
          ...enrollment.toObject(),
          id: enrollment._id.toString(),
        },
      },
      'Enrollment retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get enrollment error:', error);
    return fail(
      error.message || 'Failed to fetch enrollment',
      'FETCH_ENROLLMENT_FAILED',
      undefined,
      500
    );
  }
}
