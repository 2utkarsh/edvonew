import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { handleError, ok, parseJson } from '@/lib/http';
import { SystemSettingModel } from '@/models/SystemSetting';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    let settings = await SystemSettingModel.findOne().lean();
    if (!settings) {
      const created = await SystemSettingModel.create({ siteName: 'EDVO' });
      settings = created.toObject() as any;
    }
    return ok(settings);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
    await connectToDatabase();
    const body = await parseJson<Record<string, unknown>>(request);
    const current = await SystemSettingModel.findOne();
    const settings = current
      ? await SystemSettingModel.findByIdAndUpdate(current._id, body, { new: true }).lean()
      : await SystemSettingModel.create({ siteName: 'EDVO', ...body });
    return ok(settings);
  } catch (error) {
    return handleError(error);
  }
}


