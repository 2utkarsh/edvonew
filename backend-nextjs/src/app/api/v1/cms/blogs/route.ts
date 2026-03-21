import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { BlogModel } from '@/models/Blog';

// GET all blogs
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    const filterQuery: any = { status: 'published' };
    if (category) {
      filterQuery.category = category;
    }

    const total = await BlogModel.countDocuments(filterQuery);

    const blogs = await BlogModel.find(filterQuery)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return success(
      {
        blogs: blogs.map((b: any) => ({
          ...b.toObject(),
          id: b._id.toString(),
        })),
      },
      'Blogs retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error: any) {
    console.error('Get blogs error:', error);
    return fail(
      error.message || 'Failed to fetch blogs',
      'FETCH_BLOGS_FAILED',
      undefined,
      500
    );
  }
}
