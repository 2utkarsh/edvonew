import {
  getAdminCourseDemoPaymentSettings,
  saveAdminCourseDemoPaymentSettings,
} from '@/lib/admin-course-demo-store';
import { requireAuth } from '@/lib/auth';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { getPaymentGatewaySettings, savePaymentGatewaySettings } from '@/lib/system-settings';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(getAdminCourseDemoPaymentSettings()));
    }

    await connectToDatabase();
    return toResponse(ok(await getPaymentGatewaySettings()));
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;

    const body = await request.json();

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok(saveAdminCourseDemoPaymentSettings(body), 'Payment settings updated successfully'));
    }

    await connectToDatabase();
    const settings = await savePaymentGatewaySettings(body);
    return toResponse(ok(settings, 'Payment settings updated successfully'));
  } catch (error) {
    return handleError(error);
  }
}
