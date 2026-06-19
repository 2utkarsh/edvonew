import * as React from 'react';
import { type Participant, type Room, Track } from 'livekit-client';

type RecordingState = {
  error: string | null;
  isProcessing: boolean;
  isRecording: boolean;
};

type TileSource = {
  identity: string;
  label: string;
  stream?: MediaStream;
  track?: MediaStreamTrack;
  video?: HTMLVideoElement;
};

type ActiveRecordingResources = {
  audioContext: AudioContext | null;
  canvas: HTMLCanvasElement | null;
  canvasStream: MediaStream | null;
  tiles: TileSource[];
  animationFrameId: number | null;
};

const listeners = new Set<() => void>();

let state: RecordingState = {
  error: null,
  isProcessing: false,
  isRecording: false,
};

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: BlobPart[] = [];
let activeRoomName = 'meeting';
let activeMimeType = 'video/webm';
let activeResources: ActiveRecordingResources = {
  audioContext: null,
  animationFrameId: null,
  canvas: null,
  canvasStream: null,
  tiles: [],
};

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function setState(next: Partial<RecordingState>) {
  state = { ...state, ...next };
  emit();
}

function buildFileName(roomName: string, mimeType: string) {
  const safeRoom = roomName.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'meeting';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
  return `${safeRoom}-${stamp}.${extension}`;
}

function downloadRecording(blob: Blob, roomName: string, mimeType: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildFileName(roomName, mimeType);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pickMimeType() {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];

  if (typeof MediaRecorder === 'undefined') {
    return '';
  }

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? '';
}

function stopTracks(stream?: MediaStream | null) {
  if (!stream) {
    return;
  }

  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function cleanupResources() {
  if (activeResources.animationFrameId !== null) {
    window.cancelAnimationFrame(activeResources.animationFrameId);
  }

  stopTracks(activeResources.canvasStream);

  for (const tile of activeResources.tiles) {
    if (tile.video) {
      tile.video.pause();
      tile.video.srcObject = null;
    }
  }

  if (activeResources.audioContext) {
    void activeResources.audioContext.close().catch(() => undefined);
  }

  activeResources = {
    audioContext: null,
    animationFrameId: null,
    canvas: null,
    canvasStream: null,
    tiles: [],
  };

  mediaRecorder = null;
  recordedChunks = [];
}

function getParticipantLabel(participant: Participant) {
  return participant.name?.trim() || participant.identity || 'Participant';
}

function getParticipantTiles(participants: Participant[]) {
  return participants.map((participant) => {
    const publications = participant
      .getTrackPublications()
      .filter((publication) => publication.kind === Track.Kind.Video && publication.track);

    const preferredPublication =
      publications.find((publication) => publication.source === Track.Source.ScreenShare) ||
      publications.find((publication) => publication.source === Track.Source.Camera) ||
      publications[0];

    const mediaStreamTrack = (preferredPublication?.track as any)?.mediaStreamTrack as
      | MediaStreamTrack
      | undefined;

    if (!mediaStreamTrack) {
      return {
        identity: participant.identity,
        label: getParticipantLabel(participant),
      } satisfies TileSource;
    }

    const stream = new MediaStream([mediaStreamTrack]);
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    void video.play().catch(() => undefined);

    return {
      identity: participant.identity,
      label: getParticipantLabel(participant),
      stream,
      track: mediaStreamTrack,
      video,
    } satisfies TileSource;
  });
}

function getParticipantAudioTracks(participants: Participant[]) {
  return participants
    .flatMap((participant) =>
      participant
        .getTrackPublications()
        .filter((publication) => publication.kind === Track.Kind.Audio && publication.track)
        .map((publication) => (publication.track as any)?.mediaStreamTrack as MediaStreamTrack | undefined),
    )
    .filter((track): track is MediaStreamTrack => Boolean(track));
}

function drawTiles(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, tiles: TileSource[]) {
  const width = canvas.width;
  const height = canvas.height;
  context.fillStyle = '#050816';
  context.fillRect(0, 0, width, height);

  const count = Math.max(tiles.length, 1);
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const gap = 18;
  const tileWidth = (width - gap * (columns + 1)) / columns;
  const tileHeight = (height - gap * (rows + 1)) / rows;

  tiles.forEach((tile, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = gap + column * (tileWidth + gap);
    const y = gap + row * (tileHeight + gap);

    context.fillStyle = '#101826';
    context.fillRect(x, y, tileWidth, tileHeight);

    if (tile.video && tile.video.readyState >= 2) {
      context.drawImage(tile.video, x, y, tileWidth, tileHeight);
    } else {
      context.fillStyle = '#1d4ed8';
      context.fillRect(x, y, tileWidth, tileHeight);
      context.fillStyle = '#f8fafc';
      context.font = '600 28px system-ui';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(tile.label.slice(0, 28), x + tileWidth / 2, y + tileHeight / 2);
    }

    context.fillStyle = 'rgba(3, 7, 18, 0.7)';
    context.fillRect(x, y + tileHeight - 52, tileWidth, 52);
    context.fillStyle = '#f8fafc';
    context.font = '600 20px system-ui';
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillText(tile.label.slice(0, 30), x + 16, y + tileHeight - 26);
  });
}

function startCanvasLoop(canvas: HTMLCanvasElement, tiles: TileSource[]) {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas recording is not supported in this browser.');
  }

  const render = () => {
    drawTiles(context, canvas, tiles);
    activeResources.animationFrameId = window.requestAnimationFrame(render);
  };

  render();
}

function resolveRoomDetails(roomOrName?: Room | string) {
  if (typeof roomOrName === 'string' || roomOrName === undefined) {
    return {
      room: null,
      roomName: roomOrName || 'meeting',
    };
  }

  return {
    room: roomOrName,
    roomName: roomOrName.name || 'meeting',
  };
}

async function startLocalRecording(roomOrName?: Room | string) {
  if (state.isProcessing || state.isRecording) {
    return;
  }

  if (typeof window === 'undefined') {
    setState({ error: 'Recording is only available in the browser.' });
    return;
  }

  if (typeof MediaRecorder === 'undefined') {
    setState({ error: 'This browser does not support local recording.' });
    return;
  }

  const mimeType = pickMimeType();
  if (!mimeType) {
    setState({ error: 'No supported recording format was found in this browser.' });
    return;
  }

  const { room, roomName } = resolveRoomDetails(roomOrName);
  if (!room) {
    setState({ error: 'Meeting room is not ready for recording yet.' });
    return;
  }

  setState({ error: null, isProcessing: true });

  try {
    const participants = [room.localParticipant, ...Array.from(room.remoteParticipants.values())];
    const tiles = getParticipantTiles(participants);
    const audioTracks = getParticipantAudioTracks(participants);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    startCanvasLoop(canvas, tiles);

    const canvasStream = canvas.captureStream(24);
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    for (const audioTrack of audioTracks) {
      const sourceStream = new MediaStream([audioTrack]);
      const source = audioContext.createMediaStreamSource(sourceStream);
      source.connect(destination);
    }

    await audioContext.resume().catch(() => undefined);

    const mixedAudioTrack = destination.stream.getAudioTracks()[0];
    if (mixedAudioTrack) {
      canvasStream.addTrack(mixedAudioTrack);
    }

    activeResources = {
      audioContext,
      animationFrameId: activeResources.animationFrameId,
      canvas,
      canvasStream,
      tiles,
    };

    activeRoomName = roomName;
    activeMimeType = mimeType;
    recordedChunks = [];

    const recorder = new MediaRecorder(canvasStream, { mimeType });
    mediaRecorder = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      setState({
        error: 'Recording failed while capturing the meeting. Please try again.',
        isProcessing: false,
        isRecording: false,
      });
      cleanupResources();
    };

    recorder.onstop = () => {
      const blob = recordedChunks.length
        ? new Blob(recordedChunks, { type: activeMimeType })
        : null;

      cleanupResources();
      setState({ isProcessing: false, isRecording: false });

      if (blob) {
        downloadRecording(blob, activeRoomName, activeMimeType);
      }
    };

    recorder.start(1000);
    setState({ isProcessing: false, isRecording: true });
  } catch (error) {
    cleanupResources();
    setState({
      error: error instanceof Error ? error.message : 'Unable to start local recording.',
      isProcessing: false,
      isRecording: false,
    });
  }
}

async function stopLocalRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    setState({ isProcessing: false, isRecording: false });
    return;
  }

  setState({ isProcessing: true, error: null });
  mediaRecorder.stop();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useLocalRecording(roomOrName?: Room | string) {
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const startRecording = React.useCallback(() => startLocalRecording(roomOrName), [roomOrName]);
  const stopRecording = React.useCallback(() => stopLocalRecording(), []);
  const clearError = React.useCallback(() => setState({ error: null }), []);

  return {
    ...snapshot,
    clearError,
    startRecording,
    stopRecording,
  };
}
