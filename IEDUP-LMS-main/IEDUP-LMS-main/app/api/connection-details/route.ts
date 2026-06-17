import { randomString } from '@/lib/client-utils';
import { ConnectionDetails } from '@/lib/types';
import { AccessToken, AccessTokenOptions, VideoGrant, RoomServiceClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isKicked } from '@/lib/blackList';
import { JWT_SECRET, hasJwtSecret } from '@/lib/jwtSecret';
import { getConfiguredLiveKitUrls } from '@/lib/livekit-url';
import { isRoomClosed } from '@/lib/room-closure';

// Constants
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const COOKIE_KEY = 'participantToken';
const JWT_EXPIRY_HOURS = 12;

// Types
interface AccessTokenPayload {
  role: string;
  iat: number;
  exp: number;
  metadata?: {
    role: string;
    identity: string;
    [key: string]: any;
  };
}

export const runtime = 'nodejs';
export const maxDuration = 30;

// Custom Error Classes
class LiveKitAPIError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'LiveKitAPIError';
  }
}

class ValidationError extends LiveKitAPIError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

type QueryParams = {
  where: string | null;
  roomName: string;
  participantName: string;
  metadata: string;
  region: string | null;
};

function safeParseJson(value?: string | null) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

/**
 * Validates required environment variables
 */
function validateEnvironment(region?: string | null) {
  if (!API_KEY || !API_SECRET) {
    throw new LiveKitAPIError('Missing required environment variables: LIVEKIT_API_KEY or LIVEKIT_API_SECRET');
  }

  const urls = getConfiguredLiveKitUrls(region);
  if (!urls?.apiUrl || !urls.wsUrl) {
    throw new LiveKitAPIError('Missing required environment variables: LIVEKIT_URL or LIVEKIT_API_URL');
  }

  if (!hasJwtSecret) {
    throw new LiveKitAPIError('Missing required environment variable: JWT_SECRET');
  }

  return urls;
}

/**
 * Verifies and decodes the access token using jsonwebtoken
 */
function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as AccessTokenPayload;
    return payload;
  } catch (error) {
    console.warn('Failed to verify access token:', error);
    return null;
  }
}

/**
 * Creates a participant token with the given user info and room name
 */
const createParticipantToken = async (
  userInfo: AccessTokenOptions,
  roomName: string,
  livekitApiUrl: string,
): Promise<string> => {
  if (!API_KEY || !API_SECRET) {
    throw new LiveKitAPIError('API credentials not configured');
  }

  const roomService = new RoomServiceClient(
    livekitApiUrl,
    API_KEY,
    API_SECRET,
  );

  const rooms = await roomService.listRooms();

  let bool = true;
  const metadata = safeParseJson(userInfo.metadata);

  if(metadata.role === 'participant') {
    for(let i = 0; i < rooms.length; i++) {
      if(rooms[i].name === roomName) {
        const parse = safeParseJson(rooms[i].metadata || '{}');
        bool = typeof parse.massTogglePublishing === 'boolean' ? parse.massTogglePublishing : true;
      }
    }
  }

  if (!userInfo.identity) {
    userInfo.identity =
      typeof metadata.identity === 'string' && metadata.identity
        ? metadata.identity
        : `${roomName}-${randomString(4)}`;
  }
  
  const accessToken = new AccessToken(API_KEY, API_SECRET, userInfo);
  accessToken.ttl = `${JWT_EXPIRY_HOURS}h`;
  
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: bool,
    canPublishData: bool,
    canSubscribe: true,
  };
  
  accessToken.addGrant(grant);
  return await accessToken.toJwt();
}

/**
 * Validates required query parameters
 */
function validateQueryParams(request: NextRequest): QueryParams {
  const params = {
    roomName: request.nextUrl.searchParams.get('roomName'),
    participantName: request.nextUrl.searchParams.get('participantName'),
    region: request.nextUrl.searchParams.get('region'),
  };

  if (!params.roomName) {
    throw new ValidationError('Missing required query parameter: roomName');
  }

  if (!params.participantName) {
    throw new ValidationError('Missing required query parameter: participantName');
  }

  return params as QueryParams;
}

/**
 * Checks if user is banned/kicked
 */
function validateUserAccess(accessToken: string): void {   
  if (isKicked(accessToken)) {
    throw new LiveKitAPIError('User access denied', 403);
  }
}

/**
 * Creates connection details response
 */
function createConnectionResponse(
  serverUrl: string,
  roomName: string,
  participantToken: string,
  participantName: string,
): NextResponse {
  const data: ConnectionDetails = {
    serverUrl,
    roomName,
    participantToken,
    participantName,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  return new NextResponse(JSON.stringify(data), { headers });
}

/**
 * Main GET handler
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { roomName, participantName, region } = validateQueryParams(request);
    if (await isRoomClosed(roomName)) {
      throw new LiveKitAPIError('This live session has ended.', 410);
    }
    const livekitUrls = validateEnvironment(region);

    const accessTokenFromCookie = request.cookies.get("accessToken")?.value || "";
    
    let verifiedToken: AccessTokenPayload | null = null;

    verifiedToken = verifyAccessToken(accessTokenFromCookie);

    // Get metadata from verified token
    const metadata =
      verifiedToken?.metadata && typeof verifiedToken.metadata === 'object'
        ? verifiedToken.metadata
        : {
            identity: `${participantName}__${randomString(4)}`,
            role: 'participant',
          };

    validateUserAccess(accessTokenFromCookie);

    const participantToken = await createParticipantToken(
      {
        identity: metadata?.identity,
        name: participantName,
        metadata: JSON.stringify(metadata),
      },
      roomName,
      livekitUrls.apiUrl,
    );

    return createConnectionResponse(
      livekitUrls.wsUrl,
      roomName,
      participantToken,
      participantName
    );

  } catch (error) {
    console.error('LiveKit API Error:', error);
    
    if (error instanceof LiveKitAPIError) {
      return new NextResponse(error.message, { status: error.statusCode });
    }

    if (error instanceof Error && /ECONNREFUSED|fetch failed/i.test(error.message)) {
      return new NextResponse(
        'LiveKit server is unavailable. Verify LIVEKIT_URL or LIVEKIT_API_URL and make sure the LiveKit endpoint is reachable.',
        { status: 503 },
      );
    }
    
    return new NextResponse('Internal server error', { status: 500 });
  }
}
