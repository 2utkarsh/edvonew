import { adminHtmlResponse } from '@/lib/adminHtmlResponse';

export const dynamic = 'force-dynamic';

export function GET() {
  return adminHtmlResponse('tutorials.html');
}
