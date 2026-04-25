import { adminHtmlResponse } from '@/lib/adminHtmlResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  return adminHtmlResponse('course-payment-settings.html');
}
