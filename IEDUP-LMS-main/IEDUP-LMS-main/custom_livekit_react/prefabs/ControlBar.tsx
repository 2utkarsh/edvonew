import { RpcInvocationData, Track } from 'livekit-client';
import * as React from 'react';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { DisconnectButton } from '../components/controls/DisconnectButton';
import { TrackToggle } from '../components/controls/TrackToggle';
import { ChatIcon, GearIcon, LeaveIcon } from '../assets/icons';
import { ChatToggle } from '../components/controls/ChatToggle';
import { useLocalParticipantPermissions, usePersistentUserChoices } from '../hooks';
import { useMediaQuery } from '../hooks/internal';
import { useMaybeLayoutContext, useRoomContext } from '../context';
import { supportsScreenSharing } from '@livekit/components-core';
import { mergeProps } from '../utils';
import { StartMediaButton } from '../components/controls/StartMediaButton';
import { SettingsMenuToggle } from '../components/controls/SettingsMenuToggle';
import { IoMdPerson } from "react-icons/io";
import { ParticipantButton } from '../components/controls/ParticipantButton';
import { IoPeople } from "react-icons/io5";
import { MassControlButton } from '../components/controls/MassControlButton';
import { CiLink } from "react-icons/ci";
import { CiViewList } from "react-icons/ci";
import { AttendanceButton } from '../components/controls/AttendanceButton';
import { DeleteRoomButton } from '../components/controls/DeleteRoomButton';
import { GiSpikyExplosion } from "react-icons/gi";
import { RecordButton } from '../../components/RecordButton';
import { RaiseHandButton } from '../components/controls/RaiseHandButton';
import { FaPen, FaVolumeUp } from 'react-icons/fa';
import { roomHref } from '@/lib/url';

const AUDIO_OUTPUT_STORAGE_KEY = 'preferredAudioOutputDeviceId';
type PermissionRequestSource = 'microphone' | 'camera' | 'screen_share';

/** @public */
export type ControlBarControls = {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  leave?: boolean;
  settings?: boolean;
  participant?: boolean;
};

/** @public */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  variation?: 'minimal' | 'verbose' | 'textOnly';
  controls?: ControlBarControls;
  /**
   * If `true`, the user's device choices will be persisted.
   * This will enable the user to have the same device choices when they rejoin the room.
   * @defaultValue true
   * @alpha
   */
  saveUserChoices?: boolean;
  /**
   * Callback for hand state changes from the local participant
   */
  onHandStateChange?: (action: 'raise' | 'lower', identity: string) => void;
  onWhiteboardToggle?: () => void;
  onWhiteboardAccessToggle?: () => void;
  whiteboardOpen?: boolean;
  whiteboardMembersCanUse?: boolean;
  canCloseWhiteboard?: boolean;
}

/**
 * The `ControlBar` prefab gives the user the basic user interface to control their
 * media devices (camera, microphone and screen share), open the `Chat` and leave the room.
 *
 * @remarks
 * This component is build with other LiveKit components like `TrackToggle`,
 * `DeviceSelectorButton`, `DisconnectButton` and `StartAudio`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <ControlBar />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function ControlBar({
  variation,
  controls,
  saveUserChoices = true,
  onDeviceError,
  onHandStateChange,
  onWhiteboardToggle,
  onWhiteboardAccessToggle,
  whiteboardOpen = false,
  whiteboardMembersCanUse = false,
  canCloseWhiteboard = true,
  ...props
}: ControlBarProps) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const layoutContext = useMaybeLayoutContext();
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext?.widget.state?.showChat);
    }
  }, [layoutContext?.widget.state?.showChat]);
  const isTooLittleSpace = useMediaQuery(`(max-width: ${isChatOpen ? 1000 : 760}px)`);

  const defaultVariation = isTooLittleSpace ? 'minimal' : 'verbose';
  variation ??= defaultVariation;
  const room = useRoomContext();

  
  const [visibleControls, setVisibleControls] = React.useState({ leave: true, participant: true,  ...controls });

  const localPermissions = useLocalParticipantPermissions();
  const browserSupportsScreenSharing = supportsScreenSharing();
   
  const [isHost, setIsHost] = React.useState(false);

  React.useEffect(() => {
    console.log("hello", localPermissions)
  }, [localPermissions])

  React.useEffect(() => {
    setVisibleControls((current) => ({
      ...current,
      camera: Boolean(localPermissions?.canPublish),
      microphone: Boolean(localPermissions?.canPublish),
      screenShare: browserSupportsScreenSharing,
    }));
  }, [browserSupportsScreenSharing, localPermissions?.canPublish]);

  // React.useEffect(() => {
  //   room.registerRpcMethod(
  //     'set-publishing',
  //     async (data: RpcInvocationData) => {
  //       const parse = JSON.parse(data.payload);

  //       setVisibleControls({
  //         ...visibleControls,
  //         ...parse
  //       });


  //       if("camera" in parse) {
  //         room.localParticipant.setCameraEnabled(false)
  //       } else if("microphone" in parse) {
  //         room.localParticipant.setMicrophoneEnabled(false)
  //       }

  //       return "200"
  //     }
  // );

  // return () => {
  //   room.unregisterRpcMethod("set-publishing")
  // }
  // }, [room])

  React.useEffect(() => {
    const handleHost = () => {
      try {
        const parsed = JSON.parse(room.localParticipant.metadata ?? '{}') as { role?: string };
        const role = parsed?.role;

        setIsHost(role === 'host' || role === 'co-host')
      } catch (error) {
        console.error('Invalid metadata JSON:', room.localParticipant.metadata, error);
      }
    }

    room.on("connected", handleHost)

    return () => {
      room.off("connected", handleHost)
    }
  }, [room])

  React.useEffect(() => {
    if (!room) return;

    const handleMetadataChange = () => {
      const metadata = room.localParticipant.metadata

      try {
        const parsed = JSON.parse(metadata ?? '{}') as { role?: string };
        const role = parsed?.role;

        setIsHost(role === 'host' || role === 'co-host')
      } catch (error) {
        console.error('Invalid metadata JSON:', metadata, error);
      }
    };

    // Local participant
    room.on('participantMetadataChanged', handleMetadataChange);

    // Cleanup to prevent memory leaks
    return () => {
      room.off('participantMetadataChanged', handleMetadataChange);
    };
  }, [room]);


  const showIcon = React.useMemo(
    () => variation === 'minimal' || variation === 'verbose',
    [variation],
  );
  const showText = React.useMemo(
    () => variation === 'textOnly' || variation === 'verbose',
    [variation],
  );

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);
  const [speakerSelectionAvailable, setSpeakerSelectionAvailable] = React.useState(false);
  const [requestedPermissionSources, setRequestedPermissionSources] = React.useState<
    PermissionRequestSource[]
  >([]);

  const onScreenShareChange = React.useCallback(
    (enabled: boolean) => {
      setIsScreenShareEnabled(enabled);
    },
    [setIsScreenShareEnabled],
  );

  const htmlProps = mergeProps({ className: 'lk-control-bar' }, props);

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices });

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled],
  );

  const cameraOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled],
  );

  const requestPublishingPermission = React.useCallback(
    async (source: PermissionRequestSource) => {
      if (requestedPermissionSources.includes(source)) {
        return;
      }

      try {
        await room.localParticipant.publishData(
          new TextEncoder().encode(
            JSON.stringify({
              type: 'permission-request',
              action: 'request-publishing',
              source,
              requesterIdentity: room.localParticipant.identity,
              requesterName: room.localParticipant.name || room.localParticipant.identity,
            }),
          ),
          { reliable: true },
        );
        setRequestedPermissionSources((current) =>
          current.includes(source) ? current : [...current, source],
        );
      } catch (error) {
        console.error('Failed to request publishing permission:', error);
      }
    },
    [requestedPermissionSources, room],
  );

  React.useEffect(() => {
    const handlePermissionMessage = (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (
          data.type !== 'notify' ||
          data.target !== room.localParticipant.identity ||
          (data.action !== 'permission-approved' && data.action !== 'permission-denied')
        ) {
          return;
        }

        if (
          data.source === 'microphone' ||
          data.source === 'camera' ||
          data.source === 'screen_share'
        ) {
          setRequestedPermissionSources((current) =>
            current.filter((source) => source !== data.source),
          );
        }
      } catch (error) {
        console.error('Error handling permission response:', error);
      }
    };

    room.on('dataReceived', handlePermissionMessage);
    return () => {
      room.off('dataReceived', handlePermissionMessage);
    };
  }, [room]);

  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      setSpeakerSelectionAvailable(false);
      return;
    }

    let cancelled = false;

    const refreshAudioOutputs = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setSpeakerSelectionAvailable(devices.some((device) => device.kind === 'audiooutput'));
        }
      } catch (error) {
        if (!cancelled) {
          setSpeakerSelectionAvailable(false);
        }
      }
    };

    void refreshAudioOutputs();

    const handleDeviceChange = () => {
      void refreshAudioOutputs();
    };

    navigator.mediaDevices.addEventListener?.('devicechange', handleDeviceChange);

    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener?.('devicechange', handleDeviceChange);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !speakerSelectionAvailable) {
      return;
    }

    const savedDeviceId = window.localStorage.getItem(AUDIO_OUTPUT_STORAGE_KEY);
    if (!savedDeviceId) {
      return;
    }

    room.switchActiveDevice('audiooutput', savedDeviceId, false).catch((error) => {
      console.warn('Unable to restore saved speaker/headphone device, falling back to default.', error);
      window.localStorage.removeItem(AUDIO_OUTPUT_STORAGE_KEY);
    });
  }, [room, speakerSelectionAvailable]);

  return (
    <div {...htmlProps}>
      {visibleControls.microphone ? (
        <div className="lk-button-group">
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={showIcon}
            onChange={microphoneOnChange}
            onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Microphone, error })}
          >
            {'Microphone'}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              kind="audioinput"
              onActiveDeviceChange={(_kind, deviceId) =>
                saveAudioInputDeviceId(deviceId ?? 'default')
              }
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="lk-button"
          onClick={() => requestPublishingPermission('microphone')}
          disabled={requestedPermissionSources.includes('microphone')}
          title="Ask host to unlock microphone"
        >
          {showIcon && <FaVolumeUp />}
          {requestedPermissionSources.includes('microphone') ? 'Mic Requested' : 'Ask Mic'}
        </button>
      )}
      {visibleControls.camera ? (
        <div className="lk-button-group">
          <TrackToggle
            source={Track.Source.Camera}
            showIcon={showIcon}
            onChange={cameraOnChange}
            onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Camera, error })}
          >
            {'Camera'}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              kind="videoinput"
              onActiveDeviceChange={(_kind, deviceId) =>
                saveVideoInputDeviceId(deviceId ?? 'default')
              }
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="lk-button"
          onClick={() => requestPublishingPermission('camera')}
          disabled={requestedPermissionSources.includes('camera')}
          title="Ask host to unlock camera"
        >
          {showIcon && <IoMdPerson />}
          {requestedPermissionSources.includes('camera') ? 'Cam Requested' : 'Ask Camera'}
        </button>
      )}
      {speakerSelectionAvailable && (
        <div className="lk-button-group">
          <button type="button" className="lk-button" title="Choose speaker or Bluetooth output">
            {showIcon && <FaVolumeUp />}
            {'Speaker'}
          </button>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              kind="audiooutput"
              onActiveDeviceChange={(_kind, deviceId) => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(
                    AUDIO_OUTPUT_STORAGE_KEY,
                    deviceId ?? 'default',
                  );
                }
              }}
            />
          </div>
        </div>
      )}
      {visibleControls.screenShare && browserSupportsScreenSharing && (
        localPermissions?.canPublish === false && !isHost ? (
          <button
            type="button"
            className="lk-button"
            onClick={() => requestPublishingPermission('screen_share')}
            disabled={requestedPermissionSources.includes('screen_share')}
            title="Ask host to unlock screen sharing"
          >
            {showIcon && <FaVolumeUp />}
            {requestedPermissionSources.includes('screen_share') ? 'Share Requested' : 'Ask Share'}
          </button>
        ) : (
          <TrackToggle
            source={Track.Source.ScreenShare}
            captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
            showIcon={showIcon}
            onChange={onScreenShareChange}
            disabled={localPermissions?.canPublish === false && !isHost}
            onDeviceError={(error) => onDeviceError?.({ source: Track.Source.ScreenShare, error })}
          >
            {(isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
          </TrackToggle>
        )
      )}
      {visibleControls.chat && (
        <ChatToggle
          disabled={localPermissions?.canPublishData === false && !isHost}
          title={
            localPermissions?.canPublishData === false && !isHost
              ? 'Chat is disabled by the host'
              : 'Chat'
          }
        >
          {showIcon && <ChatIcon />}
          {'Chat'}
        </ChatToggle>
      )}
      {visibleControls.settings && (
        <SettingsMenuToggle>
          {showIcon && <GearIcon />}
          {'Settings'}
        </SettingsMenuToggle>
      )}
      {visibleControls.leave && (
        <DisconnectButton>
          {showIcon && <LeaveIcon />}
          {'Leave'}
        </DisconnectButton>
      )}
      {isHost && (
        <DeleteRoomButton>
          {showIcon && <GiSpikyExplosion />}
          {'Delete Room'}
        </DeleteRoomButton>
      )}
      {visibleControls.participant && (
        <ParticipantButton>
          {showIcon && <IoMdPerson />}
          {'Participant'}
        </ParticipantButton>
      )}
      {onWhiteboardToggle && (
        <button
          type="button"
          className="lk-button"
          onClick={onWhiteboardToggle}
          aria-pressed={whiteboardOpen}
          disabled={whiteboardOpen && !canCloseWhiteboard}
          title={
            whiteboardOpen && !canCloseWhiteboard
              ? 'Only the host or the member who opened the whiteboard can close it'
              : whiteboardOpen
                ? 'Hide whiteboard'
                : 'Show whiteboard'
          }
          style={{
            boxShadow: whiteboardOpen ? 'inset 0 0 0 2px rgba(255, 255, 255, 0.82)' : undefined,
            opacity: whiteboardOpen && !canCloseWhiteboard ? 0.65 : 1,
            cursor: whiteboardOpen && !canCloseWhiteboard ? 'not-allowed' : 'pointer',
          }}
        >
          {showIcon && <FaPen />}
          {'Whiteboard'}
        </button>
      )}
      {isHost && onWhiteboardAccessToggle && (
        <button
          type="button"
          className="lk-button"
          onClick={onWhiteboardAccessToggle}
          aria-pressed={!whiteboardMembersCanUse}
          title={
            whiteboardMembersCanUse
              ? 'Disable whiteboard access for participants'
              : 'Enable whiteboard access for participants'
          }
          style={{
            boxShadow: !whiteboardMembersCanUse ? 'inset 0 0 0 2px rgba(255, 255, 255, 0.82)' : undefined,
          }}
        >
          {showIcon && <FaPen />}
          {whiteboardMembersCanUse ? 'Lock Board' : 'Unlock Board'}
        </button>
      )}
      <RaiseHandButton onHandStateChange={onHandStateChange} />
      {isHost && (
        <MassControlButton>
          {showIcon && <IoPeople />}
          {'Mass Control'}
        </MassControlButton>
      )}
      {isHost && (
        <RecordButton />
      )}
      {isHost && (
        <AttendanceButton>
          {showIcon && <CiViewList />}
          {'Attendance'}
        </AttendanceButton>
      )}
      {isHost && (
        <button
          type='button'
          className='lk-button'
          onClick={() => {
            navigator.clipboard.writeText(
              new URL(
                roomHref(room.name, window.location.search, window.location.hash),
                window.location.origin,
              ).toString(),
            );
          }}
        >
          <CiLink /> Meet Link
        </button>
      )}
      <StartMediaButton />
    </div>
  );
}
