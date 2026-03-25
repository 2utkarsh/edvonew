import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { buildApiUrl } from '@/lib/backend-api';
import { normalizeRoomName } from '@/lib/live-classroom';

type BackendUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type RelayResult = {
  response: NextResponse;
  ok: boolean;
  fallbackAllowed: boolean;
};

const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

function createJsonResponse(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

function hasLocalLiveKitConfig() {
  return Boolean(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
}

async function parseJsonResponse(response: Response) {
  const raw = await response.text().catch(() => '');

  if (!raw) {
    return { success: false, error: { message: 'Empty response from live classroom service.' } };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      success: false,
      error: {
        message: raw,
      },
    };
  }
}

async function relayToBackend(body: Record<string, unknown>): Promise<RelayResult> {
  try {
    const response = await fetch(buildApiUrl('/api/live-classroom/token'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = await parseJsonResponse(response);
    return {
      response: createJsonResponse(response.status, payload),
      ok: response.ok,
      fallbackAllowed: [404, 405, 500, 503].includes(response.status),
    };
  } catch {
    return {
      response: createJsonResponse(503, {
        success: false,
        error: {
          message: 'Live classroom backend is not reachable right now.',
        },
      }),
      ok: false,
      fallbackAllowed: true,
    };
  }
}

async function verifyBackendToken(token: string) {
  if (!token) return null;

  try {
    const response = await fetch(buildApiUrl('/api/auth/me'), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.success || !payload?.data) {
      return null;
    }

    return payload.data as BackendUser;
  } catch {
    return null;
  }
}

function createIdentity(prefix: string, seed?: string) {
  const normalizedSeed = String(seed || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (normalizedSeed) {
    return `${prefix}-${normalizedSeed}`.slice(0, 120);
  }

  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

async function createLocalParticipantToken(body: {
  roomName: string;
  participantName: string;
  entry: 'host' | 'student';
  adminToken: string;
  studentToken: string;
}) {
  const [adminUser, studentUser] = await Promise.all([
    verifyBackendToken(body.adminToken),
    verifyBackendToken(body.studentToken),
  ]);

  let role = 'participant';
  let resolvedName = body.participantName || 'EDVO Learner';
  let identity = createIdentity('guest');
  let resolvedEmail = '';

  if (body.entry === 'host') {
    const isAllowedAdmin =
      adminUser?.role === 'admin' && String(adminUser.email || '').toLowerCase() === 'admin@edvo.com';

    if (!isAllowedAdmin) {
      return {
        error: createJsonResponse(403, {
          success: false,
          error: { message: 'Only the EDVO admin account can start host mode.' },
        }),
      };
    }

    role = 'host';
    resolvedName = body.participantName || adminUser?.name || 'EDVO Host';
    identity = createIdentity('host', adminUser?.id || adminUser?.email);
    resolvedEmail = String(adminUser?.email || '');
  } else if (studentUser) {
    resolvedName = body.participantName || studentUser.name || 'EDVO Learner';
    identity = createIdentity(studentUser.role || 'student', studentUser.id || studentUser.email);
    resolvedEmail = String(studentUser.email || '');
  } else {
    resolvedName = body.participantName || 'Guest Learner';
    identity = createIdentity('guest');
  }

  const participantToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: resolvedName,
    metadata: JSON.stringify({
      role,
      roomName: body.roomName,
      source: 'edvo-live-classroom',
      email: resolvedEmail,
    }),
  });

  participantToken.ttl = '12h';
  participantToken.addGrant({
    room: body.roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    roomAdmin: role === 'host',
  });

  return {
    data: {
      serverUrl: LIVEKIT_URL,
      roomName: body.roomName,
      participantName: resolvedName,
      participantToken: await participantToken.toJwt(),
      role,
    },
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const normalizedBody = {
    roomName: normalizeRoomName(String(body.roomName || '')),
    participantName: String(body.participantName || '').trim().slice(0, 80),
    entry: body.entry === 'host' ? 'host' : 'student',
    adminToken: String(body.adminToken || '').trim(),
    studentToken: String(body.studentToken || '').trim(),
  } as const;

  if (!normalizedBody.roomName) {
    return createJsonResponse(400, {
      success: false,
      error: { message: 'Room name is required' },
    });
  }

  const backendResult = await relayToBackend(normalizedBody);
  if (backendResult.ok) {
    return backendResult.response;
  }

  if (!hasLocalLiveKitConfig()) {
    return backendResult.fallbackAllowed
      ? createJsonResponse(503, {
          success: false,
          error: {
            message:
              'Live classroom is not configured yet. Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to either the frontend or backend environment.',
          },
        })
      : backendResult.response;
  }

  if (!backendResult.fallbackAllowed) {
    return backendResult.response;
  }

  const localResult = await createLocalParticipantToken(normalizedBody);
  if ('error' in localResult) {
    return localResult.error;
  }

  return createJsonResponse(200, {
    success: true,
    data: localResult.data,
  });
}
