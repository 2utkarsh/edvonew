'use client';

import React from 'react';
import { useRoomContext } from '../custom_livekit_react';
import { useLocalRecording } from '@/lib/useLocalRecording';

export function RecordButton() {
  const room = useRoomContext();
  const { error, isProcessing, isRecording, startRecording, stopRecording } = useLocalRecording(room);

  const handleToggle = async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }

    await startRecording();
  };

  return (
    <button
      type="button"
      className="lk-button"
      onClick={handleToggle}
      disabled={isProcessing}
      title={error || 'Start a local recording of the meeting'}
      style={{
        background: isRecording ? 'var(--lk-danger)' : undefined,
        color: isRecording ? 'var(--lk-text)' : undefined,
        opacity: isProcessing ? 0.6 : 1,
      }}
    >
      {isProcessing ? 'Preparing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
  );
}
