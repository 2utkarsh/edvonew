import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { getPublicPaymentGatewaySettings } from '@/lib/system-settings';

export async function GET() {
  try {
    await connectToDatabase();
    return toResponse(ok(await getPublicPaymentGatewaySettings()));
  } catch (error) {
    return handleError(error);
  }
}
