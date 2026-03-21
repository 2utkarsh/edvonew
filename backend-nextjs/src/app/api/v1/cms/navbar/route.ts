import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { NavbarModel } from '@/models/Navbar';

// GET navbar configuration
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const navbar = await NavbarModel.findOne({ isActive: true })
      .sort({ updatedAt: -1 })
      .lean();

    if (!navbar) {
      return success({ navbar: null }, 'No navbar configuration found');
    }

    return success(
      {
        navbar: {
          ...navbar.toObject(),
          id: navbar._id.toString(),
        },
      },
      'Navbar retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get navbar error:', error);
    return fail(
      error.message || 'Failed to fetch navbar',
      'FETCH_NAVBAR_FAILED',
      undefined,
      500
    );
  }
}
