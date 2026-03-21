import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { CourseCategoryModel } from '@/models/CourseCategory';

// GET all course categories
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const categories = await CourseCategoryModel.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    return success(
      {
        categories: categories.map((c: any) => ({
          ...c.toObject(),
          id: c._id.toString(),
        })),
      },
      'Categories retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get categories error:', error);
    return fail(
      error.message || 'Failed to fetch categories',
      'FETCH_CATEGORIES_FAILED',
      undefined,
      500
    );
  }
}
