import * as React from 'react';

type RecordingState = {
  error: string | null;
  isProcessing: boolean;
  isRecording: boolean;
};

const listeners = new Set<() => void>();

let state: RecordingState = {
  error: null,
  isProcessing: false,
  isRecording: false,
};

let mediaRecorder: MediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let recordedChunks: BlobPart[] = [];
let activeRoomName = 'meeting';
let activeMimeType = 'video/webm';

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function setState(next: Partial<RecordingState>) {
  state = { ...state, ...next };
  emit();
}

function cleanupStream() {
  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop();
    }
  }

  mediaStream = null;
  mediaRecorder = null;
  recordedChunks = [];
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

async function startLocalRecording(roomName: string) {
  if (state.isProcessing || state.isRecording) {
    return;
  }

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    setState({ error: 'Recording is only available in the browser.' });
    return;
  }

  if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') {
    setState({ error: 'This browser does not support local recording.' });
    return;
  }

  const mimeType = pickMimeType();
  if (!mimeType) {
    setState({ error: 'No supported recording format was found in this browser.' });
    return;
  }

  setState({ error: null, isProcessing: true });

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    mediaStream = stream;
    activeRoomName = roomName || 'meeting';
    activeMimeType = mimeType;
    recordedChunks = [];

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorder = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    recorder.onerror = () => {
      setState({
        error: 'Recording failed while capturing your screen. Please try again.',
        isProcessing: false,
        isRecording: false,
      });
      cleanupStream();
    };

    recorder.onstop = () => {
      const blob = recordedChunks.length
        ? new Blob(recordedChunks, { type: activeMimeType })
        : null;

      cleanupStream();
      setState({ isProcessing: false, isRecording: false });

      if (blob) {
        downloadRecording(blob, activeRoomName, activeMimeType);
      }
    };

    for (const track of stream.getTracks()) {
      track.addEventListener('ended', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });
    }

    recorder.start(1000);
    setState({ isProcessing: false, isRecording: true });
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Screen sharing permission was denied. Allow it to start local recording.'
        : error instanceof Error
          ? error.message
          : 'Unable to start local recording.';

    cleanupStream();
    setState({ error: message, isProcessing: false, isRecording: false });
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

export function useLocalRecording(roomName?: string) {
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const startRecording = React.useCallback(() => startLocalRecording(roomName || 'meeting'), [roomName]);
  const stopRecording = React.useCallback(() => stopLocalRecording(), []);
  const clearError = React.useCallback(() => setState({ error: null }), []);

  return {
    ...snapshot,
    clearError,
    startRecording,
    stopRecording,
  };
}
