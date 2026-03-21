import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail } from '@/lib/http';
import { CourseModel } from '@/models/Course';

interface RouteParams {
  params: Promise<{ instructorId: string }>;
}

// GET courses by instructor
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { instructorId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';

    const filterQuery: any = { instructorId };
    if (status) {
      filterQuery.status = status;
    }

    const courses = await CourseModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .lean();

    return success(
      {
        courses: courses.map((c: any) => ({
          ...c.toObject(),
          id: c._id.toString(),
        })),
      },
      'Instructor courses retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get instructor courses error:', error);
    return fail(
      error.message || 'Failed to fetch instructor courses',
      'FETCH_COURSES_FAILED',
      undefined,
      500
    );
  }
}
