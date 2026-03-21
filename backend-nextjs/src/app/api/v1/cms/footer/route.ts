import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { FooterModel } from '@/models/Footer';

// GET footer configuration
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const footer = await FooterModel.findOne({ isActive: true })
      .sort({ updatedAt: -1 })
      .lean();

    if (!footer) {
      return success({ footer: null }, 'No footer configuration found');
    }

    return success(
      {
        footer: {
          ...footer.toObject(),
          id: footer._id.toString(),
        },
      },
      'Footer retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get footer error:', error);
    return fail(
      error.message || 'Failed to fetch footer',
      'FETCH_FOOTER_FAILED',
      undefined,
      500
    );
  }
}
