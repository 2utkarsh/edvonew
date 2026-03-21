import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { EnrollmentModel } from '@/models/Enrollment';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET course progress
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id: courseId } = await params;

    const enrollment = await EnrollmentModel.findOne({
      userId,
      courseId,
    }).lean();

    if (!enrollment) {
      return notFound('Enrollment');
    }

    return success(
      {
        progress: {
          percentage: enrollment.progress,
          completedLectures: enrollment.completedLectures,
          lastAccessedAt: enrollment.updatedAt,
        },
      },
      'Progress retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get progress error:', error);
    return fail(
      error.message || 'Failed to fetch progress',
      'FETCH_PROGRESS_FAILED',
      undefined,
      500
    );
  }
}

// PUT update course progress
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(['student']);
    if (authResult.error) return authResult.error;

    const userId = authResult.payload.sub;
    const { id: courseId } = await params;

    const body = await request.json();
    const { lectureId, completed } = body;

    // Find enrollment
    const enrollment = await EnrollmentModel.findOne({ userId, courseId });
    if (!enrollment) {
      return notFound('Enrollment');
    }

    // Update completed lectures
    let completedLectures = enrollment.completedLectures || [];
    
    if (completed) {
      if (!completedLectures.includes(lectureId)) {
        completedLectures.push(lectureId);
      }
    } else {
      completedLectures = completedLectures.filter((id: string) => id !== lectureId);
    }

    // Calculate progress percentage
    // Note: You would need to get total lectures from course curriculum
    const totalLectures = 100; // Placeholder
    const progress = (completedLectures.length / totalLectures) * 100;

    // Update enrollment
    await EnrollmentModel.findByIdAndUpdate(enrollment._id, {
      completedLectures,
      progress,
      updatedAt: new Date(),
    });

    return success(
      {
        progress: {
          percentage: progress,
          completedLectures,
        },
      },
      'Progress updated successfully'
    );
  } catch (error: any) {
    console.error('Update progress error:', error);
    return fail(
      error.message || 'Failed to update progress',
      'UPDATE_PROGRESS_FAILED',
      undefined,
      500
    );
  }
}
