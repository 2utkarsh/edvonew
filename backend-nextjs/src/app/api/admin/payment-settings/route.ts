import { requireAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { getPaymentGatewaySettings, savePaymentGatewaySettings } from '@/lib/system-settings';

export async function GET() {
  try {
    const auth = await requireAuth(['admin']);
    if ('error' in auth) return auth.error;
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
    await connectToDatabase();

    const body = await request.json();
    const settings = await savePaymentGatewaySettings(body);
    return toResponse(ok(settings, 'Payment settings updated successfully'));
  } catch (error) {
    return handleError(error);
  }
}
