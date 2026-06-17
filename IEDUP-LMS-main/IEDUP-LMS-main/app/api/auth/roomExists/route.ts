import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RoomServiceClient } from 'livekit-server-sdk';
import { JWT_SECRET, hasJwtSecret } from '@/lib/jwtSecret';
import { getConfiguredLiveKitUrls } from '@/lib/livekit-url';
import clientPromise, { isMongoConfigured } from '@/lib/mongodb';
import { isRoomClosed } from '@/lib/room-closure';

export const runtime = 'nodejs';
export const maxDuration = 30;

type InMemoryMeeting = {
  roomName?: string;
};

type MeetingsGlobal = typeof globalThis & {
  __iedupMeetingsStore?: InMemoryMeeting[];
};

function useInMemoryMeetings() {
  return process.env.NODE_ENV !== 'production' && !isMongoConfigured;
}

function getInMemoryMeetingsStore() {
  const meetingsGlobal = globalThis as MeetingsGlobal;

  if (!meetingsGlobal.__iedupMeetingsStore) {
    meetingsGlobal.__iedupMeetingsStore = [];
  }

  return meetingsGlobal.__iedupMeetingsStore;
}

async function hasScheduledMeeting(roomName: string) {
  if (!roomName) {
    return false;
  }

  if (useInMemoryMeetings()) {
    return getInMemoryMeetingsStore().some((meeting: any) => meeting.roomName === roomName);
  }

  if (!isMongoConfigured) {
    return false;
  }

  try {
    if (!clientPromise) {
      return false;
    }

    const client = await clientPromise;
    const db = client.db('livekit_meeting');
    const meeting = await db.collection('meetings').findOne({ roomName });
    return Boolean(meeting);
  } catch (error) {
    console.error('Failed to check scheduled meeting:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!hasJwtSecret) {
      return NextResponse.json({ error: 'Server authentication is not configured' }, { status: 500 });
    }

    // Get accessToken from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 401 });
    }

    // Verify and decode the token
    let payload: JwtPayload | undefined;
    try {
      const verified = jwt.verify(accessToken, JWT_SECRET, { algorithms: ['HS256'] });
      if (typeof verified === 'object') {
        payload = verified as JwtPayload;
      } else {
        return NextResponse.json({ error: 'Invalid accessToken payload' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid accessToken' }, { status: 401 });
    }

    // Extract metadata
    const metadata = payload?.metadata || {};
    const role = metadata.role;
    if (!role) {
      return NextResponse.json({ error: 'Missing role in token metadata' }, { status: 400 });
    }

    // Get roomName from query param
    const roomName = request.nextUrl.searchParams.get('roomName');
    if (!roomName) {
      return NextResponse.json({ error: 'Missing roomName query param' }, { status: 400 });
    }

    if (await isRoomClosed(roomName)) {
      return NextResponse.json({ error: 'This live session has ended.' }, { status: 410 });
    }

    if (role === 'host') {
      return NextResponse.json({ message: 'Host verified', metadata }, { status: 200 });
    }

    // If role is participant, check if room exists
    if (role === 'participant') {
      const livekitUrls = getConfiguredLiveKitUrls();
      if (!livekitUrls?.apiUrl || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      const roomService = new RoomServiceClient(
        livekitUrls.apiUrl,
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET
      );
      try {
        const rooms = await roomService.listRooms([roomName]);
        if (rooms && rooms.length > 0) {
          return NextResponse.json({ message: 'Room exists', metadata }, { status: 200 });
        }

        const scheduledMeetingExists = await hasScheduledMeeting(roomName);
        if (scheduledMeetingExists) {
          return NextResponse.json({ message: 'Scheduled room verified', metadata }, { status: 200 });
        }

        return NextResponse.json({ error: 'Room does not exist' }, { status: 404 });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to check room existence', details: error instanceof Error ? error.message : error }, { status: 500 });
      }
    }

    // If role is neither host nor participant
    return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
