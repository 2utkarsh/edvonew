import * as React from 'react';
import { useRoomContext } from '../context';
import { mergeProps } from '../mergeProps';
import type { DeleteRoomButtonProps } from '../components/controls/DeleteRoomButton';

const encoder = new TextEncoder();

export function useDeleteRoomButton(props: DeleteRoomButtonProps) {
  const room = useRoomContext();
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!room?.name) return;
    setLoading(true);
    try {
      await room.localParticipant.publishData(
        encoder.encode(
          JSON.stringify({
            type: 'room-ended',
            roomName: room.name,
          }),
        ),
        { reliable: true },
      );

      await new Promise((resolve) => setTimeout(resolve, 300));

      const response = await fetch(apiUrl('/api/participant-control'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'destroy-room',
          participantIdentity: room.localParticipant.identity,
          roomName: room.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete room');
      }

      props.onDeleteComplete?.();
      room.disconnect();
    } catch (e) {
      alert('Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const { onDeleteComplete: _onDeleteComplete, ...buttonHtmlProps } = props;

  const buttonProps = mergeProps(buttonHtmlProps, {
    onClick: handleDelete,
    disabled: loading,
    className: 'lk-disconnect-button'
  });

  return { buttonProps };
} 
import { apiUrl } from '@/lib/url';
