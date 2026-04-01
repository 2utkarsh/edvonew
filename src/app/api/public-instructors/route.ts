import { NextRequest, NextResponse } from 'next/server';

function normalizePerson(item: Record<string, unknown>, index: number) {
  return {
    id: String(item.id || item._id || `person-${index}`),
    name: String(item.name || ''),
    title: String(item.title || item.headline || ''),
    bio: String(item.bio || ''),
    image: String(item.image || item.photo || item.avatar || '/images/edvo-official-logo-v10.png'),
  };
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const response = await fetch(`${origin}/backend/api/instructors`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Backend instructors route unavailable');
    }

    const payload = await response.json().catch(() => ({}));
    const instructorItems = (Array.isArray(payload?.data) ? payload.data : []).map(normalizePerson);

    return NextResponse.json({ success: true, data: instructorItems });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
