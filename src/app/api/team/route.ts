import { NextRequest, NextResponse } from 'next/server';

const configuredBackendBaseUrl =
  process.env.BACKEND_URL ||
  (/^https?:\/\//.test(process.env.NEXT_PUBLIC_BACKEND_URL || '') ? process.env.NEXT_PUBLIC_BACKEND_URL : '') ||
  'http://localhost:3001';

const backendBaseUrl = configuredBackendBaseUrl.replace(/\/$/, '');

const FALLBACK_TEAM_MEMBERS = [
  {
    id: 'alok-pandey',
    name: 'Alok Pandey',
    title: 'Chief Mentor, EDVO | Mentor of Change, NITI Aayog | Startup & MSME Growth Catalyst',
    bio: 'Alok Pandey is an experienced entrepreneurship mentor and ecosystem builder with 17+ years of expertise in innovation, startup development, and MSME growth.',
    image: '/images/profiles/alok-pandey.png',
  },
  {
    id: 'akanksha-singh',
    name: 'Akanksha Singh',
    title: 'Mentor, EDVO | Marketing & Growth Architect | AI Marketing Strategist',
    bio: 'Akanksha Singh is a Marketing & Growth Architect with 10+ years of experience in performance marketing, brand strategy, and digital business growth.',
    image: '/images/profiles/akanksha-singh.jpeg',
  },
  {
    id: 'krishna-bhushan-mishra',
    name: 'Krishna Bhushan Mishra',
    title: 'Mentor, EDVO | Marketing Engineer | Performance & Growth Strategist',
    bio: 'Krishna Bhushan Mishra is a Marketing Engineer and Performance & Growth Strategist with 8+ years of experience in performance marketing, data-driven strategy, and growth systems.',
    image: '/images/profiles/krishna-bhushan-mishra.jpeg',
  },
];

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${backendBaseUrl}/backend/api/team`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Backend team route unavailable');
    }

    const payload = await response.json().catch(() => ({}));
    const items = Array.isArray(payload?.data) ? payload.data : [];
    return NextResponse.json({ success: true, data: items.length ? items : FALLBACK_TEAM_MEMBERS });
  } catch {
    return NextResponse.json({ success: true, data: FALLBACK_TEAM_MEMBERS });
  }
}
