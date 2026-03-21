import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { CourseModel } from '@/models/Course';

// GET search courses
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return success({ courses: [] }, 'Search query is required');
    }

    const courses = await CourseModel.find({
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await CourseModel.countDocuments({
      status: 'published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    });

    return success(
      { courses },
      'Search results retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error: any) {
    console.error('Search courses error:', error);
    return fail(
      error.message || 'Failed to search courses',
      'SEARCH_FAILED',
      undefined,
      500
    );
  }
}
