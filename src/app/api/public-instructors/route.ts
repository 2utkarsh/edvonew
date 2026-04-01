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
    const [teamResponse, instructorResponse] = await Promise.allSettled([
      fetch(`${origin}/backend/api/team`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
      fetch(`${origin}/backend/api/instructors`, { headers: { Accept: 'application/json' }, cache: 'no-store' }),
    ]);

    const teamPayload =
      teamResponse.status === 'fulfilled' && teamResponse.value.ok
        ? await teamResponse.value.json().catch(() => ({}))
        : {};
    const instructorPayload =
      instructorResponse.status === 'fulfilled' && instructorResponse.value.ok
        ? await instructorResponse.value.json().catch(() => ({}))
        : {};

    const teamItems = (Array.isArray(teamPayload?.data) ? teamPayload.data : []).map(normalizePerson);
    const instructorItems = (Array.isArray(instructorPayload?.data) ? instructorPayload.data : []).map(normalizePerson);

    const teamNames = new Set(teamItems.map((item) => item.name.trim().toLowerCase()).filter(Boolean));
    const filteredInstructors = instructorItems.filter((item) => {
      const normalizedName = item.name.trim().toLowerCase();
      return normalizedName && !teamNames.has(normalizedName);
    });

    return NextResponse.json({ success: true, data: filteredInstructors });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
