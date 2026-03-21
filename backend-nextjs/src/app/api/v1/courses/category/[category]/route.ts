import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, notFound } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { UserModel } from '@/models/User';
import { EnrollmentModel } from '@/models/Enrollment';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET course by category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const { category } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const courses = await CourseModel.find({ 
      category: decodeURIComponent(category),
      status: 'published' 
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await CourseModel.countDocuments({ 
      category: decodeURIComponent(category),
      status: 'published' 
    });

    return success(
      { courses },
      'Courses retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error: any) {
    console.error('Get category courses error:', error);
    return fail(
      error.message || 'Failed to fetch courses',
      'FETCH_COURSES_FAILED',
      undefined,
      500
    );
  }
}
