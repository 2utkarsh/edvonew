import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

function normalizeBase(value: string) {
  const trimmed = String(value || '').trim();
  if (!trimmed || trimmed === '/') return '';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function presentationDir() {
  return path.join(process.cwd(), '.presentation-storage');
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60) || 'room';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const roomName = String(formData.get('roomName') ?? 'room');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF allowed' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dir = presentationDir();
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const filename = `${safeName(roomName)}-${stamp}.pdf`;
    const filepath = path.join(dir, filename);
    await writeFile(filepath, bytes);
    const basePath = normalizeBase(process.env.NEXT_PUBLIC_BASE_PATH || '/live');
    const fileUrl = `${basePath}/api/presentation/file/${encodeURIComponent(filename)}`;

    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Presentation upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
