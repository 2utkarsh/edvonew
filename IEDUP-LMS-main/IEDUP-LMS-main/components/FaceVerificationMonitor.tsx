'use client';

import React from 'react';
import { ConnectionState, Room, RoomEvent, Track } from 'livekit-client';
import { FaCamera, FaCheckCircle, FaClock, FaExclamationTriangle, FaUserShield } from 'react-icons/fa';

const FACE_CAPTURE_SIZE = 64;
const FACE_BLOCKS_PER_SIDE = 8;
const FACE_MATCH_THRESHOLD = 0.72;
const REFERENCE_RETRY_MS = 15000;
const DEFAULT_INTERVAL_MINUTES = Math.max(
  1,
  Number(process.env.NEXT_PUBLIC_FACE_CHECK_INTERVAL_MINUTES ?? 4),
);

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeParseMetadata(metadata?: string) {
  try {
    return metadata ? JSON.parse(metadata) : {};
  } catch {
    return {};
  }
}

function createFaceSignature(data: Uint8ClampedArray) {
  const blockSize = FACE_CAPTURE_SIZE / FACE_BLOCKS_PER_SIDE;
  const values: number[] = [];

  for (let blockY = 0; blockY < FACE_BLOCKS_PER_SIDE; blockY += 1) {
    for (let blockX = 0; blockX < FACE_BLOCKS_PER_SIDE; blockX += 1) {
      let total = 0;
      let count = 0;

      for (let y = 0; y < blockSize; y += 1) {
        for (let x = 0; x < blockSize; x += 1) {
          const pixelX = blockX * blockSize + x;
          const pixelY = blockY * blockSize + y;
          const index = (pixelY * FACE_CAPTURE_SIZE + pixelX) * 4;
          total += data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
          count += 1;
        }
      }

      values.push(total / Math.max(1, count));
    }
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  const centered = values.map((value) => value - mean);
  const magnitude = Math.sqrt(centered.reduce((sum, value) => sum + value * value, 0)) || 1;

  return centered.map((value) => value / magnitude);
}

function compareFaceSignatures(reference: number[], current: number[]) {
  return reference.reduce((sum, value, index) => sum + value * current[index], 0);
}

function normalizeBoundingBox(bounds: DOMRectReadOnly, width: number, height: number) {
  const x = Math.max(0, Math.floor(bounds.x));
  const y = Math.max(0, Math.floor(bounds.y));
  const boxWidth = Math.min(width - x, Math.ceil(bounds.width));
  const boxHeight = Math.min(height - y, Math.ceil(bounds.height));

  return {
    x,
    y,
    width: Math.max(1, boxWidth),
    height: Math.max(1, boxHeight),
  };
}

async function detectFaceSignature(detector: FaceDetectorInstance, video: HTMLVideoElement) {
  if (!video.videoWidth || !video.videoHeight) {
    return { ok: false as const, reason: 'Camera is not ready.' };
  }

  const faces = await detector.detect(video);

  if (!faces.length) {
    return { ok: false as const, reason: 'No face detected.' };
  }

  if (faces.length > 1) {
    return { ok: false as const, reason: 'Only one face should be visible.' };
  }

  const bounds = normalizeBoundingBox(faces[0].boundingBox, video.videoWidth, video.videoHeight);
  const canvas = document.createElement('canvas');
  canvas.width = FACE_CAPTURE_SIZE;
  canvas.height = FACE_CAPTURE_SIZE;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return { ok: false as const, reason: 'Unable to read camera frames.' };
  }

  context.drawImage(
    video,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    FACE_CAPTURE_SIZE,
    FACE_CAPTURE_SIZE,
  );

  const imageData = context.getImageData(0, 0, FACE_CAPTURE_SIZE, FACE_CAPTURE_SIZE);

  return {
    ok: true as const,
    signature: createFaceSignature(imageData.data),
  };
}

async function attachCameraPreview(room: Room) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const publication = room.localParticipant.getTrackPublication(Track.Source.Camera) as any;
    const track = publication?.track as any;

    if (track) {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.style.position = 'fixed';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0';
      video.style.pointerEvents = 'none';
      video.style.bottom = '0';
      video.style.left = '0';
      document.body.appendChild(video);

      track.attach(video);

      await new Promise<void>((resolve) => {
        const complete = () => resolve();
        if (video.readyState >= 2) {
          complete();
          return;
        }

        video.onloadeddata = complete;
        window.setTimeout(complete, 3000);
      });

      await video.play().catch(() => undefined);

      return {
        video,
        cleanup: () => {
          try {
            track.detach(video);
          } catch {}
          video.remove();
        },
      };
    }

    await wait(1000);
  }

  return null;
}

export default function FaceVerificationMonitor({ room }: { room: Room }) {
  const intervalMinutes = DEFAULT_INTERVAL_MINUTES;
  const intervalMs = intervalMinutes * 60 * 1000;
  const [isVisible, setIsVisible] = React.useState(false);
  const [statusText, setStatusText] = React.useState('Preparing face check...');
  const [statusTone, setStatusTone] = React.useState<'neutral' | 'success' | 'warning' | 'error'>(
    'neutral',
  );
  const [nextCheckAt, setNextCheckAt] = React.useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = React.useState<string | null>(null);

  const detectorRef = React.useRef<FaceDetectorInstance | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const videoCleanupRef = React.useRef<(() => void) | null>(null);
  const referenceSignatureRef = React.useRef<number[] | null>(null);
  const verificationIntervalRef = React.useRef<number | null>(null);
  const referenceRetryRef = React.useRef<number | null>(null);
  const startedRef = React.useRef(false);

  const clearTimers = React.useCallback(() => {
    if (verificationIntervalRef.current !== null) {
      window.clearInterval(verificationIntervalRef.current);
      verificationIntervalRef.current = null;
    }

    if (referenceRetryRef.current !== null) {
      window.clearInterval(referenceRetryRef.current);
      referenceRetryRef.current = null;
    }
  }, []);

  const cleanupPreview = React.useCallback(() => {
    if (videoCleanupRef.current) {
      videoCleanupRef.current();
      videoCleanupRef.current = null;
    }
    videoRef.current = null;
  }, []);

  const sendFaceEvent = React.useCallback(
    async (action: 'record-face-reference' | 'face-verification', payload: Record<string, unknown>) => {
      try {
        await fetch('/api/participant-control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: room.name,
            participantIdentity: room.localParticipant.identity,
            action,
            intervalMinutes,
            ...payload,
          }),
        });
      } catch (error) {
        console.error('Unable to send face verification update:', error);
      }
    },
    [intervalMinutes, room],
  );

  const ensurePreview = React.useCallback(async () => {
    if (videoRef.current) {
      return videoRef.current;
    }

    const attached = await attachCameraPreview(room);
    if (!attached) {
      return null;
    }

    videoRef.current = attached.video;
    videoCleanupRef.current = attached.cleanup;
    return attached.video;
  }, [room]);

  const runScheduledCheck = React.useCallback(async () => {
    if (!detectorRef.current || !referenceSignatureRef.current) {
      return;
    }

    const preview = await ensurePreview();
    if (!preview) {
      setStatusTone('warning');
      setStatusText('Enable camera for face check.');
      setNextCheckAt(new Date(Date.now() + intervalMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      await sendFaceEvent('face-verification', {
        verified: false,
        reason: 'camera-unavailable',
      });
      return;
    }

    const result = await detectFaceSignature(detectorRef.current, preview);
    const checkedAt = new Date();
    setLastCheckedAt(checkedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setNextCheckAt(
      new Date(Date.now() + intervalMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    if (!result.ok) {
      setStatusTone('warning');
      setStatusText(result.reason);
      await sendFaceEvent('face-verification', {
        verified: false,
        reason: result.reason,
      });
      return;
    }

    const score = compareFaceSignatures(referenceSignatureRef.current, result.signature);
    const verified = score >= FACE_MATCH_THRESHOLD;

    setStatusTone(verified ? 'success' : 'error');
    setStatusText(verified ? 'Face verified.' : 'Face did not match the reference.');

    await sendFaceEvent('face-verification', {
      verified,
      score: Number(score.toFixed(3)),
      reason: verified ? 'verified' : 'face-mismatch',
    });
  }, [ensurePreview, intervalMs, sendFaceEvent]);

  const startScheduledChecks = React.useCallback(() => {
    clearTimers();
    setNextCheckAt(
      new Date(Date.now() + intervalMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );
    verificationIntervalRef.current = window.setInterval(() => {
      void runScheduledCheck();
    }, intervalMs);
  }, [clearTimers, intervalMs, runScheduledCheck]);

  const captureReference = React.useCallback(async () => {
    if (!detectorRef.current || referenceSignatureRef.current) {
      return;
    }

    const preview = await ensurePreview();
    if (!preview) {
      setStatusTone('warning');
      setStatusText('Enable camera to capture the reference face.');
      return;
    }

    setStatusTone('neutral');
    setStatusText('Capturing reference face...');

    const result = await detectFaceSignature(detectorRef.current, preview);
    if (!result.ok) {
      setStatusTone('warning');
      setStatusText(result.reason);
      return;
    }

    referenceSignatureRef.current = result.signature;
    setStatusTone('success');
    setStatusText(`Reference captured. Checking every ${intervalMinutes} min.`);
    setLastCheckedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    await sendFaceEvent('record-face-reference', {
      verified: true,
      score: 1,
      reason: 'reference-captured',
    });

    startScheduledChecks();
  }, [ensurePreview, intervalMinutes, sendFaceEvent, startScheduledChecks]);

  const beginMonitoring = React.useCallback(async () => {
    if (startedRef.current) {
      return;
    }

    const metadata = safeParseMetadata(room.localParticipant.metadata);
    if (metadata.role !== 'participant') {
      return;
    }

    startedRef.current = true;
    setIsVisible(true);

    if (typeof window === 'undefined' || !window.FaceDetector) {
      setStatusTone('error');
      setStatusText('Face detection is not available in this browser.');
      await sendFaceEvent('face-verification', {
        verified: false,
        reason: 'unsupported-browser',
      });
      return;
    }

    detectorRef.current = new window.FaceDetector({
      fastMode: true,
      maxDetectedFaces: 1,
    });

    await captureReference();

    if (!referenceSignatureRef.current && referenceRetryRef.current === null) {
      referenceRetryRef.current = window.setInterval(() => {
        void captureReference();
      }, REFERENCE_RETRY_MS);
    }
  }, [captureReference, room.localParticipant.metadata, sendFaceEvent]);

  const stopMonitoring = React.useCallback(() => {
    clearTimers();
    cleanupPreview();
    referenceSignatureRef.current = null;
    detectorRef.current = null;
    startedRef.current = false;
    setNextCheckAt(null);
    setLastCheckedAt(null);
  }, [cleanupPreview, clearTimers]);

  React.useEffect(() => {
    const handleConnected = () => {
      void beginMonitoring();
    };

    const handleDisconnected = () => {
      stopMonitoring();
    };

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    if (room.state === ConnectionState.Connected) {
      void beginMonitoring();
    }

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      stopMonitoring();
    };
  }, [beginMonitoring, room, stopMonitoring]);

  if (!isVisible) {
    return null;
  }

  const toneColor =
    statusTone === 'success'
      ? '#53c5b1'
      : statusTone === 'warning'
        ? '#f3a53b'
        : statusTone === 'error'
          ? '#ef7b47'
          : '#b8c8bf';

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 45,
        width: 'min(22rem, calc(100vw - 2rem))',
        padding: '1rem',
        borderRadius: '1rem',
        border: '1px solid rgba(248, 243, 232, 0.12)',
        background: 'rgba(8, 22, 19, 0.86)',
        color: '#f8f3e8',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.28)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.9rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FaUserShield color={toneColor} />
          <strong style={{ fontSize: '0.98rem' }}>Face Verification</strong>
        </div>
        <span style={{ color: '#b8c8bf', fontSize: '0.8rem' }}>Every {intervalMinutes} min</span>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '0.7rem',
          color: '#b8c8bf',
          fontSize: '0.9rem',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: toneColor }}>
          {statusTone === 'success' ? (
            <FaCheckCircle />
          ) : statusTone === 'error' ? (
            <FaExclamationTriangle />
          ) : statusTone === 'warning' ? (
            <FaCamera />
          ) : (
            <FaClock />
          )}
          <span>{statusText}</span>
        </div>

        {lastCheckedAt ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span>Last check</span>
            <strong style={{ color: '#f8f3e8' }}>{lastCheckedAt}</strong>
          </div>
        ) : null}

        {nextCheckAt ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <span>Next check</span>
            <strong style={{ color: '#f8f3e8' }}>{nextCheckAt}</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}
