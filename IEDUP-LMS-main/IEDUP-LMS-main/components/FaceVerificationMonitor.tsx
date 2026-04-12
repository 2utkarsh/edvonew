'use client';

import React from 'react';
import { ConnectionState, Room, RoomEvent, Track } from 'livekit-client';
import { FaCamera, FaCheckCircle, FaClock, FaExclamationTriangle, FaUserShield } from 'react-icons/fa';
import { apiUrl } from '@/lib/url';
import {
  compareFaceSignatures,
  detectFaceSignature,
  FACE_MATCH_THRESHOLD,
  faceReferenceMatchesParticipant,
  loadStoredFaceReference,
} from '@/lib/face-verification';

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

function formatTime(value: Date | string | number) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function loadParticipantSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem('participantData');
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
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
        await fetch(apiUrl('/api/participant-control'), {
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
    if (!referenceSignatureRef.current) {
      return;
    }

    const preview = await ensurePreview();
    if (!preview) {
      setStatusTone('warning');
      setStatusText('Enable camera for face check.');
      setNextCheckAt(formatTime(Date.now() + intervalMs));
      await sendFaceEvent('face-verification', {
        verified: false,
        reason: 'camera-unavailable',
      });
      return;
    }

    const result = await detectFaceSignature(preview);
    const checkedAt = new Date();
    setLastCheckedAt(formatTime(checkedAt));
    setNextCheckAt(formatTime(Date.now() + intervalMs));

    if (!result.ok) {
      setStatusTone('warning');
      setStatusText(result.reason);
      await sendFaceEvent('face-verification', {
        verified: false,
        reason: result.reason,
        engine: result.engine,
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
      engine: result.engine,
    });
  }, [ensurePreview, intervalMs, sendFaceEvent]);

  const startScheduledChecks = React.useCallback(() => {
    clearTimers();
    setNextCheckAt(formatTime(Date.now() + intervalMs));
    verificationIntervalRef.current = window.setInterval(() => {
      void runScheduledCheck();
    }, intervalMs);
  }, [clearTimers, intervalMs, runScheduledCheck]);

  const captureReference = React.useCallback(async () => {
    if (referenceSignatureRef.current) {
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

    const result = await detectFaceSignature(preview);
    if (!result.ok) {
      setStatusTone('warning');
      setStatusText(result.reason);
      return;
    }

    referenceSignatureRef.current = result.signature;
    setStatusTone('success');
    setStatusText(`Reference captured. Checking every ${intervalMinutes} min.`);
    setLastCheckedAt(formatTime(new Date()));

    await sendFaceEvent('record-face-reference', {
      verified: true,
      score: 1,
      reason: 'reference-captured',
      engine: result.engine,
      referenceSource: 'room-reference',
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

    const participantSession = loadParticipantSession();
    const savedReference = loadStoredFaceReference();

    if (participantSession && savedReference && faceReferenceMatchesParticipant(savedReference, participantSession)) {
      referenceSignatureRef.current = savedReference.signature;
      setStatusTone('success');
      setStatusText('Sign-in face reference loaded.');
      setLastCheckedAt(null);

      await sendFaceEvent('record-face-reference', {
        verified: true,
        score: 1,
        reason: 'login-face-reference-loaded',
        engine: savedReference.engine,
        referenceCapturedAt: savedReference.capturedAt,
        referenceSource: savedReference.source,
      });

      await runScheduledCheck();
      startScheduledChecks();
      return;
    }

    await captureReference();

    if (!referenceSignatureRef.current && referenceRetryRef.current === null) {
      referenceRetryRef.current = window.setInterval(() => {
        void captureReference();
      }, REFERENCE_RETRY_MS);
    }
  }, [captureReference, room.localParticipant.metadata, runScheduledCheck, sendFaceEvent, startScheduledChecks]);

  const stopMonitoring = React.useCallback(() => {
    clearTimers();
    cleanupPreview();
    referenceSignatureRef.current = null;
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
