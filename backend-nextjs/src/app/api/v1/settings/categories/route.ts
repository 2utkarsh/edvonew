import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { CourseCategoryModel } from '@/models/CourseCategory';

// GET settings categories
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const categories = await CourseCategoryModel.distinct('category');

    return success(
      { categories },
      'Setting categories retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get setting categories error:', error);
    return fail(
      error.message || 'Failed to fetch categories',
      'FETCH_CATEGORIES_FAILED',
      undefined,
      500
    );
  }
}
