export type LiveClassroomEntry = 'host' | 'student';

export type LiveClassroomDetails = {
  title?: string;
  host?: string;
  start?: string;
  recordingUrl?: string;
};

function normalizeSegment(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function normalizeRoomName(value: string, fallback = 'edvo-live-room') {
  return normalizeSegment(value) || fallback;
}

export function buildLiveClassroomPath(
  roomName: string,
  details: LiveClassroomDetails = {},
  entry: LiveClassroomEntry = 'student',
) {
  const normalizedRoomName = normalizeRoomName(roomName);
  const params = new URLSearchParams();

  params.set('entry', entry);
  if (details.title) params.set('title', details.title);
  if (details.host) params.set('host', details.host);
  if (details.start) params.set('start', details.start);
  if (details.recordingUrl) params.set('recordingUrl', details.recordingUrl);

  const query = params.toString();
  return `/live-classroom/${encodeURIComponent(normalizedRoomName)}${query ? `?${query}` : ''}`;
}