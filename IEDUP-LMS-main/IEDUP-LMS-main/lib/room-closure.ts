import clientPromise, { isMongoConfigured } from '@/lib/mongodb';

type ClosedRoomRecord = {
  roomName: string;
  closedAt: Date;
};

type ClosedRoomsGlobal = typeof globalThis & {
  __iedupClosedRoomsStore?: ClosedRoomRecord[];
};

function useInMemoryClosedRooms() {
  return process.env.NODE_ENV !== 'production' && !isMongoConfigured;
}

function getInMemoryClosedRoomsStore() {
  const roomsGlobal = globalThis as ClosedRoomsGlobal;

  if (!roomsGlobal.__iedupClosedRoomsStore) {
    roomsGlobal.__iedupClosedRoomsStore = [];
  }

  return roomsGlobal.__iedupClosedRoomsStore;
}

export async function isRoomClosed(roomName: string) {
  if (!roomName) {
    return false;
  }

  if (useInMemoryClosedRooms()) {
    return getInMemoryClosedRoomsStore().some((entry) => entry.roomName === roomName);
  }

  if (!isMongoConfigured || !clientPromise) {
    return false;
  }

  try {
    const client = await clientPromise;
    const db = client.db('livekit_meeting');
    const closedRoom = await db.collection('closed_rooms').findOne({ roomName });
    return Boolean(closedRoom);
  } catch (error) {
    console.error('Failed to check closed room state:', error);
    return false;
  }
}

export async function closeRoom(roomName: string) {
  if (!roomName) {
    return;
  }

  const closedAt = new Date();

  if (useInMemoryClosedRooms()) {
    const store = getInMemoryClosedRoomsStore();
    const existingEntry = store.find((entry) => entry.roomName === roomName);

    if (existingEntry) {
      existingEntry.closedAt = closedAt;
      return;
    }

    store.push({ roomName, closedAt });
    return;
  }

  if (!isMongoConfigured || !clientPromise) {
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db('livekit_meeting');
    await db.collection('closed_rooms').updateOne(
      { roomName },
      {
        $set: {
          roomName,
          closedAt,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error('Failed to persist closed room state:', error);
  }
}
