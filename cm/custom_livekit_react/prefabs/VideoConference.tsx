import type {
  MessageDecoder,
  MessageEncoder,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, isWeb, log } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import * as React from 'react';
import type { MessageFormatter } from '../components';
import {
  CarouselLayout,
  ConnectionStateToast,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
  RoomName,
  TrackLoop,
} from '../components';
import { useCreateLayoutContext } from '../context';
import { usePinnedTracks, useTracks } from '../hooks';
import { Chat } from './Chat';
import { ControlBar } from './ControlBar';
import { useWarnAboutMissingStyles } from '../hooks/useWarnAboutMissingStyles';

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  chatMessageEncoder?: MessageEncoder;
  chatMessageDecoder?: MessageDecoder;
  /** @alpha */
  SettingsComponent?: React.ComponentType;
  onLeave?: () => void;
  onDeleteRoom?: () => void;
  onWhiteboardToggle?: () => void;
  onWhiteboardAccessToggle?: () => void;
  /**
   * Array of participant identities who have raised their hand.
   */
  raisedHandIdentities?: string[];
  whiteboardOpen?: boolean;
  whiteboardMembersCanUse?: boolean;
  canCloseWhiteboard?: boolean;
  /**
   * Callback for hand state changes from the local participant
   */
  onHandStateChange?: (action: 'raise' | 'lower', identity: string) => void;
}

/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, basic non-persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use these components as a starting point for your own custom video conferencing application.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({
  chatMessageFormatter,
  chatMessageDecoder,
  chatMessageEncoder,
  SettingsComponent,
  raisedHandIdentities,
  whiteboardOpen,
  whiteboardMembersCanUse,
  canCloseWhiteboard,
  onWhiteboardToggle,
  onWhiteboardAccessToggle,
  onLeave,
  onDeleteRoom,
  onHandStateChange,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const widgetUpdate = (state: WidgetState) => {
    log.debug('updating widget state', state);
    setWidgetState(state);
  };

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = tracks.filter((track) => track.source === Track.Source.ScreenShare);

  const pinnedTrack = usePinnedTracks(layoutContext)?.[0];
  const hasScreenShare = screenShareTracks.length > 0;
  const focusTrack = hasScreenShare ? screenShareTracks[0] : pinnedTrack;
  const carouselTracks = hasScreenShare
    ? tracks.filter(
        (track) =>
          !isTrackReference(track) || track.publication.source !== Track.Source.ScreenShare,
      )
    : tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  React.useEffect(() => {
    // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
    if (screenShareTracks.length > 0 && lastAutoFocusedScreenShareTrack.current === null) {
      log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
      if (isTrackReference(screenShareTracks[0])) {
        layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
        lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
      }
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          isTrackReference(track) &&
          track.publication.trackSid ===
            lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      log.debug('Auto clearing screen share focus.');
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      lastAutoFocusedScreenShareTrack.current = null;
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        (tr) =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source,
      );
      if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
        layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: updatedFocusTrack });
      }
    }
  }, [
    screenShareTracks
      .map((ref) =>
        isTrackReference(ref)
          ? `${ref.publication.trackSid}_${ref.publication.isSubscribed}`
          : `${ref.participant.identity}_${ref.source}_placeholder`,
      )
      .join(),
    pinnedTrack?.publication?.trackSid,
    tracks,
  ]);

  useWarnAboutMissingStyles();

  return (
    <div className="lk-video-conference" {...props}>
      {isWeb() && (
        <LayoutContextProvider
          value={layoutContext}
          // onPinChange={handleFocusStateChange}
          onWidgetChange={widgetUpdate}
        >
          <div
            className="lk-video-conference-inner"
            style={
              widgetState.showChat || whiteboardOpen
                ? {
                    paddingRight: whiteboardOpen
                      ? 'var(--lk-whiteboard-width, min(920px, 64vw))'
                      : 'var(--lk-chat-width, min(360px, 36vw))',
                  }
                : undefined
            }
          >
            <div className="lk-meeting-topbar">
              <div className="lk-meeting-title">
                <span className="lk-meeting-status-dot" aria-hidden="true" />
                <div>
                  <span className="lk-meeting-kicker">Live meeting</span>
                  <RoomName className="lk-meeting-room-name" />
                </div>
              </div>
              <div className="lk-meeting-meta">
                <span>{tracks.length} participant{tracks.length === 1 ? '' : 's'}</span>
                <span>{screenShareTracks.length > 0 ? 'Screen sharing' : 'Gallery view'}</span>
              </div>
            </div>
            {!focusTrack ? (
              <div className="lk-grid-layout-wrapper">
                <GridLayout tracks={tracks}>
                  <ParticipantTile raisedHandIdentities={raisedHandIdentities} />
                </GridLayout>
              </div>
            ) : hasScreenShare ? (
              <div className="lk-focus-layout-wrapper">
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    display: 'grid',
                    gridTemplateColumns: '228px minmax(0, 1fr)',
                    gap: '8px',
                    paddingBottom: '8px',
                  }}
                >
                  <aside style={{ minWidth: 0, minHeight: 0, overflow: 'auto' }}>
                    <TrackLoop tracks={carouselTracks}>
                      <ParticipantTile raisedHandIdentities={raisedHandIdentities} />
                    </TrackLoop>
                  </aside>
                  <div style={{ minWidth: 0, minHeight: 0 }}>
                    <ParticipantTile trackRef={focusTrack} raisedHandIdentities={raisedHandIdentities} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="lk-focus-layout-wrapper">
                <FocusLayoutContainer>
                  {carouselTracks.length > 0 && (
                    <CarouselLayout tracks={carouselTracks}>
                      <ParticipantTile raisedHandIdentities={raisedHandIdentities} />
                    </CarouselLayout>
                  )}
                  {focusTrack && <FocusLayout trackRef={focusTrack} raisedHandIdentities={raisedHandIdentities} />}
                </FocusLayoutContainer>
              </div>
            )}
            <ControlBar
              controls={{
                chat: true,
                settings: !!SettingsComponent,
                camera: false,
                microphone: false,
                screenShare: false,
              }}
              onLeave={onLeave}
              onDeleteRoom={onDeleteRoom}
              onHandStateChange={onHandStateChange}
              onWhiteboardToggle={onWhiteboardToggle}
              onWhiteboardAccessToggle={onWhiteboardAccessToggle}
              whiteboardOpen={whiteboardOpen}
              whiteboardMembersCanUse={whiteboardMembersCanUse}
              canCloseWhiteboard={canCloseWhiteboard}
            />
          </div>
          <Chat
            style={{ display: widgetState.showChat ? 'grid' : 'none' }}
            messageFormatter={chatMessageFormatter}
            messageEncoder={chatMessageEncoder}
            messageDecoder={chatMessageDecoder}
          />
          {SettingsComponent && (
            <div
              className="lk-settings-menu-modal"
              style={{ display: widgetState.showSettings ? 'block' : 'none' }}
            >
              <SettingsComponent />
            </div>
          )}
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
