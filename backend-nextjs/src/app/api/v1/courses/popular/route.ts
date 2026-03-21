import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { CourseModel } from '@/models/Course';

// GET popular courses
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const courses = await CourseModel.find({ status: 'published' })
      .sort({ studentsEnrolled: -1, rating: -1 })
      .limit(limit)
      .lean();

    return success(
      { courses },
      'Popular courses retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get popular courses error:', error);
    return fail(
      error.message || 'Failed to fetch popular courses',
      'FETCH_POPULAR_COURSES_FAILED',
      undefined,
      500
    );
  }
}
