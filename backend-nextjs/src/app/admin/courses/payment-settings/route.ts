import { adminHtmlResponse } from '@/lib/adminHtmlResponse';

export async function GET() {
  return adminHtmlResponse('course-payment-settings.html');
}
