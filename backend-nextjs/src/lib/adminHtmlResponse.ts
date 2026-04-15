import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

/**
 * Reads a public/admin HTML file, injects CKEditor license keys via a
 * <script> tag (so they're available to admin.js at runtime), and returns
 * a proper HTTP 200 text/html response — bypassing Next.js page rendering
 * entirely so no layout wrapper is applied.
 */
export function adminHtmlResponse(filename: string): NextResponse {
  const html = readFileSync(
    join(process.cwd(), `public/admin/${filename}`),
    'utf-8'
  );

  const ck4Key = process.env.CKEDITOR4_LICENSE_KEY?.trim();
  const ck5Key = process.env.CKEDITOR5_LICENSE_KEY?.trim();

  const keyScript =
    ck4Key || ck5Key
      ? `<script>` +
        (ck4Key
          ? `window.__EDVO_CKEDITOR4_LICENSE_KEY__=${JSON.stringify(ck4Key)};`
          : '') +
        (ck5Key
          ? `window.__EDVO_CKEDITOR5_LICENSE_KEY__=${JSON.stringify(ck5Key)};`
          : '') +
        `</script>`
      : '';

  const injected = keyScript
    ? html.replace(/(<head\b[^>]*>)/i, `$1${keyScript}`)
    : html;

  return new NextResponse(injected, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
