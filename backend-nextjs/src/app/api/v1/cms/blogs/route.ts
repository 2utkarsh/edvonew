import { getBlogCategoryFilterQuery } from '@/lib/blog-categories';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { BlogModel } from '@/models/Blog';

const BLOG_CMS_SELECT = 'title slug excerpt featuredImage category categories author status order readTime publishedAt createdAt updatedAt';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category');

    const filterQuery: any = { status: 'published' };
    if (category) {
      Object.assign(filterQuery, getBlogCategoryFilterQuery(category));
    }

    const [total, blogs] = await Promise.all([
      BlogModel.countDocuments(filterQuery),
      BlogModel.find(filterQuery, BLOG_CMS_SELECT)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return success(
      {
        blogs: blogs.map((blog: any) => ({
          ...blog,
          id: blog._id.toString(),
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