import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { verifyAccessToken } from '@/lib/auth';
import { fail, success, toResponse } from '@/lib/http';

type TokenBody = {
  roomName: string;
  participantName: string;
  entry: 'host' | 'student';
  adminToken: string;
  studentToken: string;
};

const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || '';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

function normalizeRoomName(value: string, fallback = 'edvo-live-room') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return normalized || fallback;
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

function verifyTokenSilently(token: string) {
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

async function buildParticipantToken(body: TokenBody) {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return {
      error: toResponse(
        fail(
          'Live classroom is not configured yet. Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to the backend environment.',
          'LIVEKIT_NOT_CONFIGURED',
          undefined,
          503,
        ),
      ),
    };
  }

  const adminUser = verifyTokenSilently(body.adminToken);
  const studentUser = verifyTokenSilently(body.studentToken);

  let role = 'participant';
  let resolvedName = body.participantName || 'EDVO Learner';
  let identity = createIdentity('guest');
  let resolvedEmail = '';

  if (body.entry === 'host') {
    const isAllowedAdmin =
      adminUser?.role === 'admin' && String(adminUser.email || '').toLowerCase() === 'admin@edvo.com';

    if (!isAllowedAdmin) {
      return {
        error: toResponse(fail('Only the EDVO admin account can start host mode.', 'FORBIDDEN', undefined, 403)),
      };
    }

    role = 'host';
    resolvedName = body.participantName || adminUser?.name || 'EDVO Host';
    identity = createIdentity('host', adminUser?.sub || adminUser?.email);
    resolvedEmail = String(adminUser?.email || '');
  } else if (studentUser) {
    role = studentUser.role || 'student';
    resolvedName = body.participantName || studentUser.name || 'EDVO Learner';
    identity = createIdentity(studentUser.role || 'student', studentUser.sub || studentUser.email);
    resolvedEmail = String(studentUser.email || '');
  }

  const participantToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: resolvedName,
    metadata: JSON.stringify({
      role,
      roomName: body.roomName,
      source: 'edvo-live-classroom-backend',
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
  const normalizedBody: TokenBody = {
    roomName: normalizeRoomName(String(body.roomName || '')),
    participantName: String(body.participantName || '').trim().slice(0, 80),
    entry: body.entry === 'host' ? 'host' : 'student',
    adminToken: String(body.adminToken || '').trim(),
    studentToken: String(body.studentToken || '').trim(),
  };

  if (!normalizedBody.roomName) {
    return toResponse(fail('Room name is required', 'VALIDATION_ERROR', undefined, 400));
  }

  const tokenResult = await buildParticipantToken(normalizedBody);
  if ('error' in tokenResult) {
    return tokenResult.error;
  }

  return toResponse(success(tokenResult.data));
}

