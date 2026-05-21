'use client';

import React from 'react';
import { FaArrowLeft, FaCamera, FaCheckCircle, FaExclamationTriangle, FaUserShield } from 'react-icons/fa';
import { detectFaceSignature, type StoredFaceReference } from '@/lib/face-verification';

type ParticipantIdentity = {
  id: string;
  name: string;
  email: string;
};

type ParticipantFaceEnrollmentProps = {
  participant: ParticipantIdentity;
  onBack: () => void;
  onSuccess: (reference: StoredFaceReference) => Promise<void> | void;
};

export default function ParticipantFaceEnrollment({
  participant,
  onBack,
  onSuccess,
}: ParticipantFaceEnrollmentProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusTone, setStatusTone] = React.useState<'neutral' | 'success' | 'error'>('neutral');
  const [statusText, setStatusText] = React.useState('Allow camera access to capture your face reference.');

  React.useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatusTone('error');
        setStatusText('Camera access is not supported in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
          },
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }

        setIsCameraReady(true);
        setStatusTone('neutral');
        setStatusText('Center your face in the frame and capture when ready.');
      } catch (error) {
        setStatusTone('error');
        setStatusText('Camera access is required to complete face verification.');
      }
    };

    void startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureReference = React.useCallback(async () => {
    if (!videoRef.current) {
      return;
    }

    setIsSubmitting(true);
    setStatusTone('neutral');
    setStatusText('Capturing your face reference...');

    try {
      const result = await detectFaceSignature(videoRef.current);

      if (!result.ok) {
        setStatusTone('error');
        setStatusText(result.reason);
        return;
      }

      const reference: StoredFaceReference = {
        signature: result.signature,
        capturedAt: new Date().toISOString(),
        source: 'participant-login',
        engine: result.engine,
        participantId: participant.id,
        participantEmail: participant.email,
        participantName: participant.name,
      };

      await onSuccess(reference);
      setStatusTone('success');
      setStatusText('Face reference captured successfully.');
    } catch (error) {
      setStatusTone('error');
      setStatusText('Unable to capture your face right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess, participant]);

  const toneColor =
    statusTone === 'success' ? '#53c5b1' : statusTone === 'error' ? '#ef7b47' : '#b8c8bf';

  return (
    <>
      <span className="auth-badge">
        <FaUserShield />
        Face Verification
      </span>

      <div>
        <h1 className="auth-title">Verify Your Face</h1>
        <p className="auth-subtitle">This reference is used to verify you inside the learning room.</p>
      </div>

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1rem',
          border: '1px solid rgba(248, 243, 232, 0.12)',
          background: 'rgba(8, 22, 19, 0.7)',
          aspectRatio: '4 / 3',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {!isCameraReady ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#f8f3e8',
              background: 'rgba(8, 22, 19, 0.82)',
            }}
          >
            <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'center' }}>
              <FaCamera size={28} />
              <span>Starting camera...</span>
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          color: toneColor,
          fontSize: '0.95rem',
          lineHeight: 1.5,
        }}
      >
        {statusTone === 'success' ? <FaCheckCircle /> : statusTone === 'error' ? <FaExclamationTriangle /> : <FaCamera />}
        <span>{statusText}</span>
      </div>

      <div className="auth-link-row" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          className="auth-secondary-link"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <FaArrowLeft />
          Back
        </button>

        <button
          type="button"
          className="auth-submit"
          disabled={!isCameraReady || isSubmitting}
          onClick={() => void captureReference()}
        >
          {isSubmitting ? <span className="button-spinner" /> : <FaUserShield />}
          {isSubmitting ? 'Verifying' : 'Capture face'}
        </button>
      </div>
    </>
  );
}
