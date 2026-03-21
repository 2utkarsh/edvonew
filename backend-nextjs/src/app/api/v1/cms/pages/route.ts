import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { PageModel } from '@/models/Page';

// GET all pages
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    const filterQuery: any = { status: 'published' };
    if (slug) {
      filterQuery.slug = slug;
    }

    const pages = await PageModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .lean();

    return success(
      {
        pages: pages.map((p: any) => ({
          ...p.toObject(),
          id: p._id.toString(),
        })),
      },
      'Pages retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get pages error:', error);
    return fail(
      error.message || 'Failed to fetch pages',
      'FETCH_PAGES_FAILED',
      undefined,
      500
    );
  }
}
