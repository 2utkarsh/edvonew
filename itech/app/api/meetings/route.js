import { NextResponse } from "next/server";
import clientPromise, { isMongoConfigured } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { validateMeeting, createMeetingDocument } from "@/lib/meeting-model";
import { RoomServiceClient } from "livekit-server-sdk";
import { getConfiguredLiveKitUrls } from "@/lib/livekit-url";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function useInMemoryMeetings() {
  return process.env.NODE_ENV !== "production" && !isMongoConfigured;
}

function ensureMeetingsStorage() {
  if (useInMemoryMeetings()) {
    return null;
  }

  if (!isMongoConfigured) {
    return NextResponse.json(
      {
        success: false,
        error: "MONGODB_URI is required for deployed meeting storage.",
      },
      { status: 503 }
    );
  }

  return null;
}

function getInMemoryMeetingsStore() {
  if (!global.__iedupMeetingsStore) {
    global.__iedupMeetingsStore = [];
  }
  return global.__iedupMeetingsStore;
}

function parseDurationToMs(duration) {
  if (typeof duration !== "string" || !duration.trim()) {
    return 45 * 60 * 1000;
  }

  const match = duration.trim().match(/(\d+)\s*(minute|minutes|hour|hours)/i);
  if (!match) {
    return 45 * 60 * 1000;
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return 45 * 60 * 1000;
  }

  const unit = match[2].toLowerCase();
  if (unit.startsWith("hour")) {
    return value * 60 * 60 * 1000;
  }

  return value * 60 * 1000;
}

function formatRoomTitle(roomName) {
  if (typeof roomName !== "string" || !roomName.trim()) {
    return "Live room";
  }

  return roomName
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeMeeting(meeting, now, activeRoomNames) {
  const id = meeting.id || meeting._id?.toString?.() || meeting.roomName;
  const roomName = meeting.roomName || id || "";
  const startDate = new Date(meeting.date);
  const durationMs = parseDurationToMs(meeting.duration);
  const endDate = new Date(startDate.getTime() + durationMs);
  const isLive = activeRoomNames.has(roomName);
  const isJoinWindowOpen = !isLive && endDate > now && startDate <= now;

  return {
    ...meeting,
    id,
    roomName,
    _id: undefined,
    isLive,
    isJoinWindowOpen,
    endsAt: endDate.toISOString(),
  };
}

function buildAdHocLiveMeetings(activeRooms, knownRoomNames, now) {
  return activeRooms
    .filter((room) => room?.name && !knownRoomNames.has(room.name))
    .filter((room) => !room.name.startsWith("personal-"))
    .map((room) => ({
      id: `live-${room.name}`,
      title: formatRoomTitle(room.name),
      description: "Live room in progress.",
      date: now.toISOString(),
      duration: "Live now",
      roomName: room.name,
      createdAt: now,
      updatedAt: now,
      isLive: true,
      isJoinWindowOpen: true,
      endsAt: now.toISOString(),
    }));
}

function formatMeetingsResponse(meetings, activeRooms = []) {
  const now = new Date();
  const activeRoomNames = new Set(activeRooms.map((room) => room.name).filter(Boolean));
  const processedMeetings = meetings.map((meeting) =>
    normalizeMeeting(meeting, now, activeRoomNames)
  );
  const knownRoomNames = new Set(processedMeetings.map((meeting) => meeting.roomName));
  const live = [
    ...processedMeetings.filter((meeting) => meeting.isLive),
    ...buildAdHocLiveMeetings(activeRooms, knownRoomNames, now),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcoming = processedMeetings.filter(
    (meeting) => !meeting.isLive && new Date(meeting.endsAt) > now
  );
  const past = processedMeetings.filter(
    (meeting) => !meeting.isLive && new Date(meeting.endsAt) <= now
  );

  return {
    success: true,
    data: {
      live,
      upcoming: upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)),
      past: past.sort((a, b) => new Date(b.date) - new Date(a.date)),
    },
  };
}

async function getActiveRooms() {
  const livekitUrls = getConfiguredLiveKitUrls();
  if (!livekitUrls?.apiUrl || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    return [];
  }

  try {
    const roomService = new RoomServiceClient(
      livekitUrls.apiUrl,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );
    return await roomService.listRooms();
  } catch (error) {
    console.error("Unable to list active LiveKit rooms:", error);
    return [];
  }
}

// GET /api/meetings - Fetch all meetings
export async function GET() {
  try {
    const storageError = ensureMeetingsStorage();
    if (storageError) {
      return storageError;
    }

    const activeRooms = await getActiveRooms();

    if (useInMemoryMeetings()) {
      return NextResponse.json(
        formatMeetingsResponse(getInMemoryMeetingsStore(), activeRooms),
        { headers: NO_STORE_HEADERS }
      );
    }

    const client = await clientPromise;
    const db = client.db("livekit_meeting");
    const meetings = await db
      .collection("meetings")
      .find({})
      .sort({ date: 1 })
      .toArray();

    return NextResponse.json(formatMeetingsResponse(meetings, activeRooms), {
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request) {
  try {
    const storageError = ensureMeetingsStorage();
    if (storageError) {
      return storageError;
    }

    const body = await request.json();

    // Validate meeting data
    const validation = validateMeeting(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Create meeting document
    const meetingDoc = createMeetingDocument(body);

    if (useInMemoryMeetings()) {
      const store = getInMemoryMeetingsStore();
      const createdMeeting = {
        ...meetingDoc,
        id: new ObjectId().toString(),
      };
      store.push(createdMeeting);

      return NextResponse.json(
        {
          success: true,
          data: createdMeeting,
          storage: "memory",
        },
        { status: 201 }
      );
    }

    // Insert into MongoDB
    const client = await clientPromise;
    const db = client.db("livekit_meeting");
    const result = await db.collection("meetings").insertOne(meetingDoc);

    // Return created meeting
    const createdMeeting = {
      ...meetingDoc,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdMeeting,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}

// PATCH /api/meetings - Update meeting fields (e.g., title)
export async function PATCH(request) {
  try {
    const storageError = ensureMeetingsStorage();
    if (storageError) {
      return storageError;
    }

    const body = await request.json();
    const { id, title, description, date, duration } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Meeting id is required" },
        { status: 400 }
      );
    }

    if (useInMemoryMeetings()) {
      const store = getInMemoryMeetingsStore();
      const index = store.findIndex((meeting) => meeting.id === id);

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: "Meeting not found" },
          { status: 404 }
        );
      }

      const update = { ...store[index], updatedAt: new Date() };
      if (typeof title === "string") update.title = title.trim();
      if (typeof description === "string") update.description = description.trim();
      if (typeof duration === "string") update.duration = duration;
      if (typeof date === "string" || date instanceof Date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
          return NextResponse.json(
            { success: false, error: "Invalid date format" },
            { status: 400 }
          );
        }
        update.date = d;
      }

      store[index] = update;
      return NextResponse.json({ success: true, storage: "memory" });
    }

    const client = await clientPromise;
    const db = client.db("livekit_meeting");

    const update = { updatedAt: new Date() };
    if (typeof title === 'string') update.title = title.trim();
    if (typeof description === 'string') update.description = description.trim();
    if (typeof duration === 'string') update.duration = duration;
    if (typeof date === 'string' || date instanceof Date) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date format" },
          { status: 400 }
        );
      }
      update.date = d;
    }

    if (Object.keys(update).length === 1) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("meetings")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}
