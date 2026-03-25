import {
  getAdminCourseDemoPaymentSettings,
  saveAdminCourseDemoPaymentSettings,
} from '@/lib/admin-course-demo-store';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { getPaymentGatewaySettings, savePaymentGatewaySettings } from '@/lib/system-settings';

export async function GET(request: Request) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

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
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

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
