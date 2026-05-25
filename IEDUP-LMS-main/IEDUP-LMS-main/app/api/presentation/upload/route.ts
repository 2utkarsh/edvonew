import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 30;

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
    const dir = path.join(process.cwd(), 'public', 'presentations');
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const filename = `${safeName(roomName)}-${stamp}.pdf`;
    const filepath = path.join(dir, filename);
    await writeFile(filepath, bytes);

    return NextResponse.json({ url: `/presentations/${filename}` }, { status: 200 });
  } catch (error) {
    console.error('Presentation upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

