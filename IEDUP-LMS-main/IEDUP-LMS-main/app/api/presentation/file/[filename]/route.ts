import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

function presentationDir() {
  return path.join(process.cwd(), '.presentation-storage');
}

function safeFilename(value: string) {
  const normalized = path.basename(String(value || ''));
  return normalized.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await context.params;
    const safe = safeFilename(filename);

    if (!safe || !safe.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Missing PDF' }, { status: 404 });
    }

    const bytes = await readFile(path.join(presentationDir(), safe));
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Missing PDF' }, { status: 404 });
  }
}
