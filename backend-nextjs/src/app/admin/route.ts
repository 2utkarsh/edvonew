import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const filePath = join(process.cwd(), 'src/app/admin/page.html');
  const html = readFileSync(filePath, 'utf-8');
  return new NextResponse(html, {
    headers: { 'content-type': 'text/html' },
  });
}
