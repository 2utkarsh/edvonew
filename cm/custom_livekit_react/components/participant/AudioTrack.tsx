import * as React from 'react';
import { useMediaTrackBySourceOrName } from '../../hooks/useMediaTrackBySourceOrName';
import type { TrackReference } from '@livekit/components-core';
import { log } from '@livekit/components-core';
import { RemoteAudioTrack, RemoteTrackPublication } from 'livekit-client';
import { useEnsureTrackRef } from '../../context';

/** @public */
export interface AudioTrackProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  /** The track reference of the track from which the audio is to be rendered. */
  trackRef?: TrackReference;

  onSubscriptionStatusChanged?: (subscribed: boolean) => void;
  /** Sets the volume of the audio track. By default, the range is between `0.0` and `1.0`. */
  volume?: number;
  /**
   * Mutes the audio track if set to `true`.
   * @remarks
   * If set to `true`, the server will stop sending audio track data to the client.
   * @alpha
   */
  muted?: boolean;
}

/**
 * The AudioTrack component is responsible for rendering participant audio tracks.
 * This component must have access to the participant's context, or alternatively pass it a `Participant` as a property.
 *
 * @example
 * ```tsx
 *   <ParticipantTile>
 *     <AudioTrack trackRef={trackRef} />
 *   </ParticipantTile>
 * ```
 *
 * @see `ParticipantTile` component
 * @public
 */
export const AudioTrack: (
  props: AudioTrackProps & React.RefAttributes<HTMLAudioElement>,
) => React.ReactNode = /* @__PURE__ */ React.forwardRef<HTMLAudioElement, AudioTrackProps>(
  function AudioTrack(
    { trackRef, onSubscriptionStatusChanged, volume, ...props }: AudioTrackProps,
    ref,
  ) {
    const trackReference = useEnsureTrackRef(trackRef);

    const mediaEl = React.useRef<HTMLAudioElement>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const mediaSourceRef = React.useRef<MediaElementAudioSourceNode | null>(null);
    const gainNodeRef = React.useRef<GainNode | null>(null);
    const compressorRef = React.useRef<DynamicsCompressorNode | null>(null);
    React.useImperativeHandle(ref, () => mediaEl.current as HTMLAudioElement);

    const {
      elementProps,
      isSubscribed,
      track,
      publication: pub,
    } = useMediaTrackBySourceOrName(trackReference, {
      element: mediaEl,
      props,
    });

    React.useEffect(() => {
      onSubscriptionStatusChanged?.(!!isSubscribed);
    }, [isSubscribed, onSubscriptionStatusChanged]);

    React.useEffect(() => {
      if (track === undefined || volume === undefined) {
        return;
      }
      if (track instanceof RemoteAudioTrack) {
        track.setVolume(Math.min(volume, 1));
      } else {
        log.warn('Volume can only be set on remote audio tracks.');
      }
    }, [volume, track]);

    React.useEffect(() => {
      const mediaElement = mediaEl.current;
      if (!mediaElement || typeof window === 'undefined') {
        return;
      }

      const requestedVolume = volume ?? 1;
      mediaElement.volume = Math.min(requestedVolume, 1);

      if (requestedVolume <= 1) {
        gainNodeRef.current?.gain.setValueAtTime(
          1,
          audioContextRef.current?.currentTime ?? 0,
        );
        return;
      }

      const AudioContextCtor = window.AudioContext ?? (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

      if (!AudioContextCtor) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      const audioContext = audioContextRef.current;

      if (!mediaSourceRef.current) {
        mediaSourceRef.current = audioContext.createMediaElementSource(mediaElement);
      }

      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContext.createGain();
      }

      if (!compressorRef.current) {
        compressorRef.current = audioContext.createDynamicsCompressor();
        compressorRef.current.threshold.value = -24;
        compressorRef.current.knee.value = 18;
        compressorRef.current.ratio.value = 3;
        compressorRef.current.attack.value = 0.003;
        compressorRef.current.release.value = 0.2;
      }

      mediaSourceRef.current.disconnect();
      gainNodeRef.current.disconnect();
      compressorRef.current.disconnect();

      mediaSourceRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(compressorRef.current);
      compressorRef.current.connect(audioContext.destination);
      gainNodeRef.current.gain.setValueAtTime(
        Math.min(requestedVolume, 2.5),
        audioContext.currentTime,
      );

      void audioContext.resume().catch(() => undefined);

      return () => {
        mediaSourceRef.current?.disconnect();
        gainNodeRef.current?.disconnect();
        compressorRef.current?.disconnect();
      };
    }, [volume]);

    React.useEffect(() => {
      if (pub === undefined || props.muted === undefined) {
        return;
      }
      if (pub instanceof RemoteTrackPublication) {
        pub.setEnabled(!props.muted);
      } else {
        log.warn('Can only call setEnabled on remote track publications.');
      }
    }, [props.muted, pub, track]);

    React.useEffect(() => {
      return () => {
        gainNodeRef.current?.disconnect();
        compressorRef.current?.disconnect();
        mediaSourceRef.current?.disconnect();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          void audioContextRef.current.close().catch(() => undefined);
        }
      };
    }, []);

    return <audio ref={mediaEl} autoPlay playsInline {...elementProps} />;
  },
);
