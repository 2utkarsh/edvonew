import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { success, fail } from '@/lib/http';
import { SystemSettingModel } from '@/models/SystemSetting';

// GET all settings (public)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const filterQuery: any = { isActive: true };
    if (category) {
      filterQuery.category = category;
    }

    const settings = await SystemSettingModel.find(filterQuery)
      .sort({ category: 1, key: 1 })
      .lean();

    const settingsObject = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return success(
      { settings: settingsObject },
      'Settings retrieved successfully'
    );
  } catch (error: any) {
    console.error('Get settings error:', error);
    return fail(
      error.message || 'Failed to fetch settings',
      'FETCH_SETTINGS_FAILED',
      undefined,
      500
    );
  }
}
