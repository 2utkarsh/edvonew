'use client';

import { decodePassphrase } from '@/lib/client-utils';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { ConnectionDetails } from '@/lib/types';
import { ParticipantList } from '@/components/participant list/ParticipantList';
import {
  formatChatMessageLinks,
  LocalUserChoices,
  PreJoin,
  useConnectionState,
  RoomContext,
  useAudioPlayback,
  VideoConference,
} from '../../../custom_livekit_react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
  RoomEvent,
  RemoteParticipant,
} from 'livekit-client';
import React, { useState } from 'react';
import Notification from '@/components/Notification';
import { MassControl } from '@/components/MassControl';
import RoomWhiteboard from '@/components/RoomWhiteboard';

import { apiUrl, roomPath } from '@/lib/url';

const CONN_DETAILS_ENDPOINT = process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? apiUrl('/api/connection-details');
const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU !== 'false';
const encoder = new TextEncoder();
const ACTIVE_ROOM_STORAGE_PREFIX = 'iedup-active-room';

function parseParticipantRole(metadata?: string) {
  try {
    const parsed = JSON.parse(metadata ?? '{}') as { role?: string };
    return parsed.role;
  } catch {
    return undefined;
  }
}

export function PageClientImpl(props: {
  roomName: string;
  where?: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined,
  );
  const [joinError, setJoinError] = React.useState<string | null>(null);
  const preJoinDefaults = React.useMemo(() => {
    return {
      username: '',
      videoEnabled: true,
      audioEnabled: true,
    };
  }, []);
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | undefined>(undefined);
  const roomSessionStorageKey = React.useMemo(
    () => `${ACTIVE_ROOM_STORAGE_PREFIX}:${props.roomName}`,
    [props.roomName],
  );

  const readErrorMessage = React.useCallback(async (response: Response, fallback: string) => {
    try {
      const text = await response.text();
      if (!text) return fallback;

      try {
        const parsed = JSON.parse(text);
        return parsed.error || parsed.message || fallback;
      } catch {
        return text;
      }
    } catch {
      return fallback;
    }
  }, []);

  const establishRoomConnection = React.useCallback(async (values: LocalUserChoices) => {
    setJoinError(null);
    setPreJoinChoices(values);

    if (typeof window !== 'undefined') {
      localStorage.setItem(roomSessionStorageKey, JSON.stringify(values));
    }

    const accessTokenURL = new URL(apiUrl("/api/auth/accessToken"), window.location.origin);
    accessTokenURL.searchParams.append('participantName', values.username);
    const accessTokenResp = await fetch(accessTokenURL.toString());
    if (accessTokenResp.status !== 200) {
      setJoinError(await readErrorMessage(accessTokenResp, 'Failed to initialize room access.'));
      return;
    }

    const roomExistsURL = new URL(apiUrl("/api/auth/roomExists"), window.location.origin);
    roomExistsURL.searchParams.append('roomName', (props.roomName).split('$')[0]);
    const roomExistsResp = await fetch(roomExistsURL.toString());
    if (roomExistsResp.status !== 200) {
      setJoinError(await readErrorMessage(roomExistsResp, 'Failed to verify room access.'));
      return;
    }

    const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
    url.searchParams.append('roomName', (props.roomName).split('$')[0]);
    url.searchParams.append('participantName', values.username);
    if (props.where) {
      url.searchParams.append('where', props.where);
    }
    if (props.region) {
      url.searchParams.append('region', props.region);
    }
    const connectionDetailsResp = await fetch(url.toString());
    if (connectionDetailsResp.status !== 200) {
      const errorMessage = await readErrorMessage(
        connectionDetailsResp,
        'Failed to connect to the meeting server.',
      );
      setJoinError(errorMessage);
      return;
    }
    const connectionDetailsData = await connectionDetailsResp.json();
    setConnectionDetails(connectionDetailsData);
  }, [props.region, props.roomName, props.where, readErrorMessage, roomSessionStorageKey]);

  const handlePreJoinSubmit = React.useCallback(async (values: LocalUserChoices) => {
    await establishRoomConnection(values);
  }, [establishRoomConnection]);

  const handlePreJoinError = React.useCallback((e: any) => console.error(e), []);

  const restoreRoomConnection = React.useCallback(
    async (values: LocalUserChoices) => {
      setJoinError(null);
      setPreJoinChoices(values);

      const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
      url.searchParams.append('roomName', (props.roomName).split('$')[0]);
      url.searchParams.append('participantName', values.username);
      if (props.where) {
        url.searchParams.append('where', props.where);
      }
      if (props.region) {
        url.searchParams.append('region', props.region);
      }

      const connectionDetailsResp = await fetch(url.toString());
      if (connectionDetailsResp.status !== 200) {
        throw new Error(await readErrorMessage(connectionDetailsResp, 'Failed to restore room access.'));
      }

      const connectionDetailsData = await connectionDetailsResp.json();
      setConnectionDetails(connectionDetailsData);
    },
    [props.region, props.roomName, props.where, readErrorMessage],
  );

  React.useEffect(() => {
    // Store the current room route in sessionStorage as 'lastRoute'
    if (typeof window !== 'undefined') {
      const pathname = roomPath(props.roomName);
      sessionStorage.setItem('lastRoute', pathname);
    }
  }, [props.roomName]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || preJoinChoices !== undefined || connectionDetails) {
      return;
    }

    const savedSession = localStorage.getItem(roomSessionStorageKey);
    if (!savedSession) {
      return;
    }

    try {
      const parsed = JSON.parse(savedSession) as LocalUserChoices;
      if (typeof parsed?.username !== 'string' || !parsed.username.trim()) {
        localStorage.removeItem(roomSessionStorageKey);
        return;
      }

      void restoreRoomConnection(parsed).catch(async (error) => {
        console.warn('Fast room restore failed, falling back to full reconnection.', error);
        await establishRoomConnection(parsed);
      });
    } catch (error) {
      console.error('Failed to restore active room session:', error);
      localStorage.removeItem(roomSessionStorageKey);
    }
  }, [connectionDetails, establishRoomConnection, preJoinChoices, roomSessionStorageKey]);

  return (
    <main data-lk-theme="default">
      {(!connectionDetails || preJoinChoices === undefined) ? (
        <div className="lk-prejoin-page">
          <div className="lk-prejoin-stage">
            {joinError && (
              <div
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(127, 29, 29, 0.9)',
                  border: '1px solid rgba(248, 113, 113, 0.45)',
                  color: '#fee2e2',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                }}
              >
                {joinError}
              </div>
            )}
            <PreJoin
              defaults={preJoinDefaults}
              onSubmit={handlePreJoinSubmit}
              onError={handlePreJoinError}
              roomName={props.roomName}
            />
          </div>
        </div>
      ) : (
        <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          options={{ codec: props.codec, hq: props.hq }}
        />
      )}
    </main>
  );
}

function VideoConferenceComponent(props: {
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
}) {
  const e2eePassphrase =
    typeof window !== 'undefined' && decodePassphrase(location.hash.substring(1));

  const worker = React.useMemo(
    () =>
      typeof window !== 'undefined' && e2eePassphrase
        ? new Worker(new URL('livekit-client/e2ee-worker', import.meta.url))
        : undefined,
    [e2eePassphrase],
  );
  const e2eeEnabled = !!(e2eePassphrase && worker);
  const keyProvider = React.useMemo(() => new ExternalE2EEKeyProvider(), []);
  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);

  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    return {
      videoCaptureDefaults: {
        deviceId: props.userChoices.videoDeviceId ?? undefined,
        resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers: props.options.hq
          ? [VideoPresets.h1080, VideoPresets.h720]
          : [VideoPresets.h540, VideoPresets.h216],
        red: !e2eeEnabled,
        videoCodec,
      },
      audioCaptureDefaults: {
        deviceId: props.userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
      e2ee: e2eeEnabled
        ? {
            keyProvider,
            worker,
          }
        : undefined,
    };
  }, [props.userChoices, props.options.hq, props.options.codec, e2eeEnabled, keyProvider, worker]);

  const room = React.useMemo(() => new Room(roomOptions), []);
  const micRetryAttemptedRef = React.useRef(false);
  const audioUnlockAttemptRef = React.useRef(false);
  const connectionState = useConnectionState(room);
  const { canPlayAudio, startAudio } = useAudioPlayback(room);

  const enableMicrophoneWithFallback = React.useCallback(async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (error: any) {
      const isMissingDevice =
        error?.name === 'NotFoundError' || /requested device not found/i.test(error?.message ?? '');

      if (isMissingDevice && !micRetryAttemptedRef.current) {
        micRetryAttemptedRef.current = true;
        console.warn('Microphone device from saved preferences missing, retrying with default.');
        await room.localParticipant.setMicrophoneEnabled(true, { deviceId: undefined });
        return;
      }

      throw error;
    }
  }, [room]);

  React.useEffect(() => {
    if (e2eeEnabled) {
      keyProvider
        .setKey(decodePassphrase(e2eePassphrase))
        .then(() => {
          room.setE2EEEnabled(true).catch((e: Error) => {
            if (e instanceof DeviceUnsupportedError) {
              alert(
                `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`,
              );
              console.error(e);
            } else {
              throw e;
            }
          });
        })
        .then(() => setE2eeSetupComplete(true));
    } else {
      setE2eeSetupComplete(true);
    }
  }, [e2eeEnabled, room, e2eePassphrase, keyProvider]);

  React.useEffect(() => {
    return () => {
      worker?.terminate();
    };
  }, [worker]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  const markAttendance = React.useCallback(async () => {
    const CONN_DETAILS_ENDPOINT = apiUrl('/api/participant-control');

    const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);

    const payload = {
      roomName: room.name,
      participantIdentity: room.localParticipant.identity,
      action: 'mark-attendance',
      metadata: room.metadata
    };

    await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }, [room]);

  const handleError = React.useCallback((error: Error) => {
    console.error(error);
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
  }, []);
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error(error);
    alert(
      `Encountered an unexpected encryption error, check the console logs for details: ${error.message}`,
    );
  }, []);
  const handleMediaDevicesError = React.useCallback(
    (error: Error, kind?: MediaDeviceKind) => {
      const isAudioError = kind === 'audioinput';
      const isMissingDevice =
        error?.name === 'NotFoundError' || /requested device not found/i.test(error?.message ?? '');

      if (isAudioError && isMissingDevice && !micRetryAttemptedRef.current) {
        enableMicrophoneWithFallback().catch(handleError);
        return;
      }

      handleError(error);
    },
    [enableMicrophoneWithFallback, handleError],
  );


  React.useEffect(() => {
    let isActive = true;

    room.on(RoomEvent.EncryptionError, handleEncryptionError);
    room.on(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    room.on(RoomEvent.Connected, markAttendance);

    const connectToRoom = async () => {
      if (!e2eeSetupComplete) {
        return;
      }

      try {
        await room.connect(
          props.connectionDetails.serverUrl,
          props.connectionDetails.participantToken,
          connectOptions,
        );

        if (!isActive) {
          room.disconnect();
          return;
        }

        try {
          await room.startAudio();
        } catch (error) {
          console.warn('Audio playback still requires an explicit browser gesture.', error);
        }

        if (props.userChoices.videoEnabled) {
          await room.localParticipant.setCameraEnabled(true);
        }

        if (props.userChoices.audioEnabled) {
          await enableMicrophoneWithFallback();
        }
      } catch (error) {
        if (isActive) {
          handleError(error as Error);
        }
      }
    };

    connectToRoom();

    return () => {
      isActive = false;
      room.off(RoomEvent.EncryptionError, handleEncryptionError);
      room.off(RoomEvent.MediaDevicesError, handleMediaDevicesError);
      room.off(RoomEvent.Connected, markAttendance);
      room.disconnect();
    };
  }, [
    e2eeSetupComplete,
    room,
    props.connectionDetails,
    props.userChoices,
    connectOptions,
    enableMicrophoneWithFallback,
    handleError,
    handleEncryptionError,
    handleMediaDevicesError,
    markAttendance,
  ]);

  React.useEffect(() => {
    if (connectionState !== 'connected' || canPlayAudio) {
      return;
    }

    const unlockAudio = async () => {
      if (audioUnlockAttemptRef.current) {
        return;
      }

      audioUnlockAttemptRef.current = true;

      try {
        await startAudio();
      } catch (error) {
        console.warn('Retrying audio playback after user interaction failed.', error);
      } finally {
        audioUnlockAttemptRef.current = false;
      }
    };

    const handleInteraction = () => {
      void unlockAudio();
    };

    const listenerOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };

    window.addEventListener('pointerdown', handleInteraction, listenerOptions);
    window.addEventListener('touchstart', handleInteraction, listenerOptions);
    window.addEventListener('keydown', handleInteraction, { capture: true });

    return () => {
      window.removeEventListener('pointerdown', handleInteraction, listenerOptions);
      window.removeEventListener('touchstart', handleInteraction, listenerOptions);
      window.removeEventListener('keydown', handleInteraction, { capture: true });
    };
  }, [canPlayAudio, connectionState, startAudio]);

  const [notify, setNotify] = useState<boolean>(false);
  const [notifyText, setNotifyText] = useState<string>('');
  const [handVisible, setHandVisible] = useState(false)
  const [participantIdentityHand, setParticipantIdentityHand] = useState("")
  const [raisedHandIdentities, setRaisedHandIdentities] = useState<string[]>([]);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [whiteboardOwnerIdentity, setWhiteboardOwnerIdentity] = useState<string | null>(null);
  const [whiteboardMembersCanUse, setWhiteboardMembersCanUse] = useState(true);
  const [isLocalHost, setIsLocalHost] = useState(false);
  const [requestedPermissionSources, setRequestedPermissionSources] = useState<
    Array<'microphone' | 'camera' | 'screen_share' | 'whiteboard'>
  >([]);

  const refreshLocalRole = React.useCallback(() => {
    const role = parseParticipantRole(room.localParticipant.metadata);
    setIsLocalHost(role === 'host' || role === 'co-host');
  }, [room]);

  React.useEffect(() => {
    refreshLocalRole();

    room.on(RoomEvent.Connected, refreshLocalRole);
    room.on(RoomEvent.ParticipantMetadataChanged, refreshLocalRole);

    return () => {
      room.off(RoomEvent.Connected, refreshLocalRole);
      room.off(RoomEvent.ParticipantMetadataChanged, refreshLocalRole);
    };
  }, [refreshLocalRole, room]);

  const publishWhiteboardVisibility = React.useCallback(
    async (
      nextOpen: boolean,
      destinationIdentities?: string[],
      ownerIdentity?: string | null,
      allowParticipants?: boolean,
    ) => {
      try {
        await room.localParticipant.publishData(
          encoder.encode(
            JSON.stringify({
              type: 'whiteboard-control',
              action: nextOpen ? 'open' : 'close',
              actor: room.localParticipant.identity,
              ownerIdentity: nextOpen ? ownerIdentity ?? room.localParticipant.identity : null,
              ...(typeof allowParticipants === 'boolean' ? { allowParticipants } : {}),
            }),
          ),
          {
            reliable: true,
            destinationIdentities,
          },
        );
      } catch (error) {
        console.error('Failed to broadcast whiteboard state:', error);
      }
    },
    [room],
  );

  const publishWhiteboardAccess = React.useCallback(
    async (allowParticipants: boolean, destinationIdentities?: string[]) => {
      try {
        await room.localParticipant.publishData(
          encoder.encode(
            JSON.stringify({
              type: 'whiteboard-control',
              action: 'set-access',
              actor: room.localParticipant.identity,
              allowParticipants,
            }),
          ),
          {
            reliable: true,
            destinationIdentities,
          },
        );
      } catch (error) {
        console.error('Failed to broadcast whiteboard access state:', error);
      }
    },
    [room],
  );

  const requestPermission = React.useCallback(
    async (source: 'microphone' | 'camera' | 'screen_share' | 'whiteboard') => {
      if (requestedPermissionSources.includes(source)) {
        return;
      }

      try {
        await room.localParticipant.publishData(
          encoder.encode(
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
        setNotify(true);
        setNotifyText('Request sent to admin.');
      } catch (error) {
        console.error('Failed to request permission:', error);
      }
    },
    [encoder, requestedPermissionSources, room],
  );

  const handleWhiteboardToggle = React.useCallback(() => {
    if (!isLocalHost && !whiteboardMembersCanUse) {
      void requestPermission('whiteboard');
      return;
    }

    setWhiteboardOpen((current) => {
      const canCloseCurrentBoard =
        isLocalHost || whiteboardOwnerIdentity === room.localParticipant.identity;

      if (current && !canCloseCurrentBoard) {
        setNotify(true);
        setNotifyText('Only the host or the member who opened the whiteboard can close it.');
        return current;
      }

      const nextOpen = !current;
      const nextOwnerIdentity = nextOpen ? room.localParticipant.identity : null;
      setWhiteboardOwnerIdentity(nextOwnerIdentity);
      void publishWhiteboardVisibility(
        nextOpen,
        undefined,
        nextOwnerIdentity,
        undefined,
      );
      return nextOpen;
    });
  }, [
    isLocalHost,
    publishWhiteboardVisibility,
    requestPermission,
    room,
    whiteboardMembersCanUse,
    whiteboardOwnerIdentity,
  ]);

  const handleWhiteboardAccessToggle = React.useCallback(() => {
    if (!isLocalHost) {
      return;
    }

    setWhiteboardMembersCanUse((current) => {
      const next = !current;
      void publishWhiteboardAccess(next);
      setNotify(true);
      setNotifyText(
        next
          ? 'Participants can use the whiteboard again.'
          : 'Participant whiteboard access has been disabled.',
      );
      return next;
    });
  }, [isLocalHost, publishWhiteboardAccess]);

  const handleWhiteboardClose = React.useCallback(() => {
    setWhiteboardOpen((current) => {
      const canCloseCurrentBoard =
        isLocalHost || whiteboardOwnerIdentity === room.localParticipant.identity;

      if (current && !canCloseCurrentBoard) {
        setNotify(true);
        setNotifyText('Only the host or the member who opened the whiteboard can close it.');
        return current;
      }

      if (current) {
        setWhiteboardOwnerIdentity(null);
        void publishWhiteboardVisibility(false, undefined, null);
      }

      return false;
    });
  }, [isLocalHost, publishWhiteboardVisibility, room, whiteboardOwnerIdentity]);

  // Callback to handle local participant hand state changes
  const handleLocalHandStateChange = React.useCallback((action: 'raise' | 'lower', identity: string) => {
    if (action === 'raise') {
      setRaisedHandIdentities(prev => prev.includes(identity) ? prev : [...prev, identity]);
    } else {
      setRaisedHandIdentities(prev => prev.filter(id => id !== identity));
    }
  }, []);

  React.useEffect(() => {
    const handleData = (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        // console.log('Received control message:', data);
        
        if (data.type === 'notify') {
          if (data.action === 'raise') {
            setNotify(true)
            setNotifyText(`${data.name} rasied hand!`)
            setHandVisible(true)
            setParticipantIdentityHand(data.identity)
            setRaisedHandIdentities(prev => prev.includes(data.identity) ? prev : [...prev, data.identity]);
          } else if(data.action === 'lower') {
            setNotify(false)
            setHandVisible(false)
            setParticipantIdentityHand("")
            setRaisedHandIdentities(prev => prev.filter(id => id !== data.identity));
          } else if(data.action === "can-publish") {
            setNotify(true)
            setNotifyText("You can enable camera, microphone and share screen")
          } else if (data.action === 'request-screen-share') {
            setNotify(true)
            setNotifyText(`${data.name || 'The host'} asked you to share your screen.`)
          } else if (
            data.action === 'permission-approved' &&
            data.target === room.localParticipant.identity
          ) {
            setNotify(true);
            setNotifyText(
              data.source === 'camera'
                ? 'Host approved your camera request.'
                : data.source === 'microphone'
                  ? 'Host approved your microphone request.'
                  : 'Host approved your permission request.',
            );

            if (
              data.source === 'microphone' ||
              data.source === 'camera' ||
              data.source === 'screen_share' ||
              data.source === 'whiteboard'
            ) {
              setRequestedPermissionSources((current) =>
                current.filter((source) => source !== data.source),
              );
            }

            if (data.source === 'camera') {
              room.localParticipant.setCameraEnabled(true).catch((error) => {
                console.error('Failed to enable camera after host approval:', error);
              });
            } else if (data.source === 'microphone') {
              enableMicrophoneWithFallback().catch((error) => {
                console.error('Failed to enable microphone after host approval:', error);
              });
            } else if (data.source === 'screen_share') {
              room.localParticipant.setScreenShareEnabled(true).catch((error) => {
                console.error('Failed to enable screen share after host approval:', error);
              });
            } else if (data.source === 'whiteboard') {
              setNotify(true);
              setNotifyText('Host approved your whiteboard request.');
            }
          } else if (
            data.action === 'permission-denied' &&
            data.target === room.localParticipant.identity
          ) {
            if (
              data.source === 'microphone' ||
              data.source === 'camera' ||
              data.source === 'screen_share' ||
              data.source === 'whiteboard'
            ) {
              setRequestedPermissionSources((current) =>
                current.filter((source) => source !== data.source),
              );
            }
            setNotify(true);
            setNotifyText(
              data.source === 'camera'
                ? 'Host denied your camera request.'
                : data.source === 'microphone'
                  ? 'Host denied your microphone request.'
                  : data.source === 'screen_share'
                    ? 'Host denied your screen sharing request.'
                    : data.source === 'whiteboard'
                      ? 'Host denied your whiteboard request.'
                  : 'Host denied your permission request.',
            );
          }
        } else if (data.type === 'whiteboard-control') {
          if (typeof data.allowParticipants === 'boolean') {
            setWhiteboardMembersCanUse(data.allowParticipants);
          }

          if (data.action === 'open' || data.action === 'close') {
            setWhiteboardOpen(data.action === 'open');
            setWhiteboardOwnerIdentity(
              data.action === 'open' ? data.ownerIdentity ?? data.actor ?? null : null,
            );
          }

          if (data.action === 'set-access' && data.allowParticipants === false) {
            if (!isLocalHost) {
              setNotify(true);
              setNotifyText('The admin has disabled whiteboard access for participants.');
            }
          }
        }
      } catch (error) {
        console.error('Error handling data message:', error);
      }
    };

    room.on('dataReceived', handleData);
    return () => {
      room.off('dataReceived', handleData);
    };
  }, [enableMicrophoneWithFallback, isLocalHost, room]);

  React.useEffect(() => {
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      if (whiteboardOpen) {
        void publishWhiteboardVisibility(
          true,
          [participant.identity],
          whiteboardOwnerIdentity,
          undefined,
        );
      }

      if (!whiteboardMembersCanUse) {
        void publishWhiteboardAccess(false, [participant.identity]);
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [
    publishWhiteboardAccess,
    publishWhiteboardVisibility,
    room,
    whiteboardMembersCanUse,
    whiteboardOpen,
    whiteboardOwnerIdentity,
  ]);

  const canCloseWhiteboard =
    !whiteboardOpen ||
    isLocalHost ||
    whiteboardOwnerIdentity === room.localParticipant.identity;
  const canDrawWhiteboard =
    !whiteboardOpen ||
    isLocalHost ||
    (whiteboardMembersCanUse && whiteboardOwnerIdentity === room.localParticipant.identity);

  return (
    <div className="lk-room-container" style={{ position: 'relative', minHeight: '100vh', height: '100svh' }}>
      <RoomContext.Provider value={room}>
          <VideoConference
            chatMessageFormatter={formatChatMessageLinks}
            SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
            raisedHandIdentities={raisedHandIdentities}
            onHandStateChange={handleLocalHandStateChange}
            onWhiteboardToggle={handleWhiteboardToggle}
            onWhiteboardAccessToggle={handleWhiteboardAccessToggle}
            whiteboardOpen={whiteboardOpen}
            whiteboardMembersCanUse={whiteboardMembersCanUse}
            canCloseWhiteboard={canCloseWhiteboard}
          />
        <RoomWhiteboard
          canDraw={canDrawWhiteboard}
          isOpen={whiteboardOpen}
          onClose={handleWhiteboardClose}
          room={room}
        />
        <MassControl/>
        <ParticipantList handVisible={handVisible} participantIdentityHand={participantIdentityHand} />
        <Notification visible={notify} setVisible={setNotify} text={notifyText}/>
        <RecordingIndicator />
      </RoomContext.Provider>
    </div>
  );
}
