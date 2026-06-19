'use client';
import * as React from 'react';
import {
  useMaybeLayoutContext,
  MediaDeviceMenu,
  useRoomContext,
} from '../custom_livekit_react';
import styles from '../styles/SettingsMenu.module.css';
import { CameraSettings } from './CameraSettings';
import { useLocalRecording } from '@/lib/useLocalRecording';

/**
 * @alpha
 */
export interface SettingsMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @alpha
 */
export function SettingsMenu(props: SettingsMenuProps) {
  const layoutContext = useMaybeLayoutContext();
  const room = useRoomContext();
  const [isHost, setIsHost] = React.useState(false);
  const { error, isProcessing, isRecording, startRecording, stopRecording } = useLocalRecording(room.name);

  React.useEffect(() => {
    const checkHostStatus = () => {
      const localParticipant = room.localParticipant;
      const metadata = localParticipant.metadata ? JSON.parse(localParticipant.metadata) : {};
      setIsHost(metadata.role === 'host');
    };

    checkHostStatus();
  }, [room]);

  const settings = React.useMemo(() => {
    return {
      media: { camera: true, microphone: true, label: 'Media Devices', speaker: true },
      recording: isHost ? { label: 'Recording' } : undefined,
    };
  }, [isHost]);

  const tabs = React.useMemo(
    () => Object.keys(settings).filter((t) => t !== undefined) as Array<keyof typeof settings>,
    [settings],
  );
  const [activeTab, setActiveTab] = React.useState(tabs[0]);

  const toggleRoomRecording = React.useCallback(async () => {
    if (room.isE2EEEnabled) {
      return;
    }

    if (isRecording) {
      await stopRecording();
      return;
    }

    await startRecording();
  }, [isRecording, room.isE2EEEnabled, startRecording, stopRecording]);

  return (
    <div className="settings-menu" style={{
      width: '100%',
      maxWidth: '400px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'var(--lk-bg2)',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      zIndex: 1000
    }} {...props}>
      <div className={styles.tabs} style={{ marginBottom: '20px' }}>
        {tabs.map(
          (tab) =>
            settings[tab] && (
              <button
                className={`${styles.tab} lk-button`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-pressed={tab === activeTab}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '14px'
                }}
              >
                {
                  // @ts-ignore
                  settings[tab].label
                }
              </button>
            ),
        )}
      </div>
      <div className="tab-content" style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {settings.media && settings.media.camera && (
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Camera</h3>
                <section>
                  <CameraSettings />
                </section>
              </div>
            )}
            {settings.media && settings.media.microphone && (
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Microphone</h3>
                <section />
              </div>
            )}
            {settings.media && settings.media.speaker && (
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Speaker & Headphones</h3>
                <section className="lk-button-group">
                  <span className="lk-button">Audio Output</span>
                  <div className="lk-button-group-menu">
                    <MediaDeviceMenu kind="audiooutput"></MediaDeviceMenu>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
        {activeTab === 'recording' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Record Meeting</h3>
            <section>
              <p style={{ margin: '0 0 16px 0', color: 'var(--lk-text-secondary)' }}>
                {isRecording
                  ? 'Local browser recording is active. Stop recording to download the file.'
                  : 'Start a local browser recording by choosing a tab, window, or screen.'}
              </p>
              {error && (
                <p style={{ margin: '0 0 16px 0', color: '#f87171', fontSize: '13px' }}>
                  {error}
                </p>
              )}
              <button
                disabled={isProcessing}
                onClick={() => toggleRoomRecording()}
                className="lk-button"
                title={room.isE2EEEnabled ? 'Recording of encrypted meetings is not supported.' : undefined}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: isRecording ? 'var(--lk-danger)' : 'var(--lk-bg3)',
                  transition: 'background-color 0.2s',
                  opacity: isProcessing ? 0.6 : 1,
                }}
              >
                {isProcessing ? 'Preparing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </section>
          </div>
        )}
      </div>
      <button
        className={`lk-button ${styles.settingsCloseButton}`}
        onClick={() => layoutContext?.widget.dispatch?.({ msg: 'toggle_settings' })}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '10px',
          background: 'var(--lk-bg3)',
          borderRadius: '4px'
        }}
      >
        Close
      </button>
    </div>
  );
}
