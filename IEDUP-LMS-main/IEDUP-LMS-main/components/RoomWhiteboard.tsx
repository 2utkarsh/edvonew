'use client';

import * as React from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  FaHighlighter,
  FaPencilAlt,
  FaPen,
  FaTimes,
  FaTrashAlt,
} from 'react-icons/fa';
import styles from './RoomWhiteboard.module.css';

type WhiteboardTool = 'pencil' | 'pen' | 'marker';

type WhiteboardPoint = {
  x: number;
  y: number;
};

type WhiteboardStroke = {
  id: string;
  author: string;
  color: string;
  createdAt: number;
  points: WhiteboardPoint[];
  size: number;
  tool: WhiteboardTool;
};

type WhiteboardMessage =
  | {
      type: 'whiteboard';
      action: 'stroke';
      stroke: WhiteboardStroke;
    }
  | {
      type: 'whiteboard';
      action: 'clear';
      actor: string;
    }
  | {
      type: 'whiteboard';
      action: 'request-sync';
      requester: string;
    }
  | {
      type: 'whiteboard';
      action: 'sync-state';
      target: string;
      strokes: WhiteboardStroke[];
    };

type RoomWhiteboardProps = {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
};

const BOARD_COLORS = [
  '#111827',
  '#1d4ed8',
  '#0f766e',
  '#15803d',
  '#b45309',
  '#b91c1c',
  '#7e22ce',
];

const TOOL_CONFIG: Record<
  WhiteboardTool,
  { alpha: number; sizeMultiplier: number }
> = {
  pencil: { alpha: 0.62, sizeMultiplier: 0.85 },
  pen: { alpha: 1, sizeMultiplier: 1 },
  marker: { alpha: 0.3, sizeMultiplier: 1.9 },
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PAYLOAD_LIMIT_BYTES = 14_000;

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function pointDistance(a: WhiteboardPoint, b: WhiteboardPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function reducePoints(points: WhiteboardPoint[], maxPoints = 220) {
  if (points.length <= maxPoints) {
    return points;
  }

  const reduced: WhiteboardPoint[] = [];
  const lastIndex = points.length - 1;
  const step = lastIndex / (maxPoints - 1);

  for (let index = 0; index < maxPoints; index += 1) {
    const point = points[Math.round(index * step)];
    if (!point) continue;

    const previous = reduced[reduced.length - 1];
    if (!previous || previous.x !== point.x || previous.y !== point.y) {
      reduced.push(point);
    }
  }

  return reduced;
}

function mergeUniqueStrokes(
  current: WhiteboardStroke[],
  incoming: WhiteboardStroke[],
) {
  if (incoming.length === 0) {
    return current;
  }

  const seen = new Set(current.map((stroke) => stroke.id));
  const merged = [...current];

  for (const stroke of incoming) {
    if (seen.has(stroke.id)) continue;
    seen.add(stroke.id);
    merged.push(stroke);
  }

  merged.sort((a, b) => a.createdAt - b.createdAt);
  return merged;
}

function sanitizePoint(value: unknown): WhiteboardPoint | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const x = Number((value as { x?: unknown }).x);
  const y = Number((value as { y?: unknown }).y);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    x: clampUnit(x),
    y: clampUnit(y),
  };
}

function sanitizeStroke(value: unknown): WhiteboardStroke | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const toolValue = (value as { tool?: unknown }).tool;
  const tool: WhiteboardTool =
    toolValue === 'pencil' || toolValue === 'marker' || toolValue === 'pen'
      ? toolValue
      : 'pen';

  const rawPoints = Array.isArray((value as { points?: unknown[] }).points)
    ? (value as { points: unknown[] }).points
    : [];
  const points = rawPoints
    .map((point) => sanitizePoint(point))
    .filter((point): point is WhiteboardPoint => point !== null);

  if (points.length === 0) {
    return null;
  }

  const size = Number((value as { size?: unknown }).size);

  return {
    id:
      typeof (value as { id?: unknown }).id === 'string'
        ? (value as { id: string }).id
        : `stroke-${Date.now()}`,
    author:
      typeof (value as { author?: unknown }).author === 'string'
        ? (value as { author: string }).author
        : 'participant',
    color:
      typeof (value as { color?: unknown }).color === 'string'
        ? (value as { color: string }).color
        : '#111827',
    createdAt:
      typeof (value as { createdAt?: unknown }).createdAt === 'number'
        ? (value as { createdAt: number }).createdAt
        : Date.now(),
    points: reducePoints(points),
    size: Number.isFinite(size) ? Math.max(1, Math.min(24, size)) : 6,
    tool,
  };
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: WhiteboardStroke,
  width: number,
  height: number,
) {
  const settings = TOOL_CONFIG[stroke.tool];
  const lineWidth = Math.max(1, stroke.size * settings.sizeMultiplier);
  const points = stroke.points;

  if (points.length === 0) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.globalAlpha = settings.alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lineWidth;

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x * width, points[0].y * height, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x * width, points[0].y * height);

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    ctx.lineTo(point.x * width, point.y * height);
  }

  ctx.stroke();
  ctx.restore();
}

export default function RoomWhiteboard({
  isOpen,
  onClose,
  room,
}: RoomWhiteboardProps) {
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pointerIdRef = React.useRef<number | null>(null);
  const draftStrokeRef = React.useRef<WhiteboardStroke | null>(null);
  const strokesRef = React.useRef<WhiteboardStroke[]>([]);
  const [tool, setTool] = React.useState<WhiteboardTool>('pen');
  const [size, setSize] = React.useState(6);
  const [color, setColor] = React.useState('#111827');
  const [strokes, setStrokes] = React.useState<WhiteboardStroke[]>([]);
  const [draftStroke, setDraftStroke] = React.useState<WhiteboardStroke | null>(null);
  const [surfaceSize, setSurfaceSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  React.useEffect(() => {
    draftStrokeRef.current = draftStroke;
  }, [draftStroke]);

  const publishMessage = React.useCallback(
    async (payload: WhiteboardMessage) => {
      try {
        const encoded = encoder.encode(JSON.stringify(payload));
        if (encoded.byteLength > PAYLOAD_LIMIT_BYTES) {
          console.warn('Whiteboard payload exceeded data channel limit.');
          return;
        }

        await room.localParticipant.publishData(encoded, { reliable: true });
      } catch (error) {
        console.error('Unable to publish whiteboard update:', error);
      }
    },
    [room],
  );

  const publishSyncState = React.useCallback(
    async (target: string) => {
      const existingStrokes = strokesRef.current;

      if (existingStrokes.length === 0) {
        return;
      }

      for (let count = existingStrokes.length; count > 0; count -= 8) {
        const payload: WhiteboardMessage = {
          type: 'whiteboard',
          action: 'sync-state',
          target,
          strokes: existingStrokes.slice(-count),
        };

        const encoded = encoder.encode(JSON.stringify(payload));
        if (encoded.byteLength <= PAYLOAD_LIMIT_BYTES) {
          try {
            await room.localParticipant.publishData(encoded, { reliable: true });
          } catch (error) {
            console.error('Unable to sync whiteboard state:', error);
          }
          return;
        }
      }
    },
    [room],
  );

  React.useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      setSurfaceSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || surfaceSize.width === 0 || surfaceSize.height === 0) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(surfaceSize.width * devicePixelRatio);
    canvas.height = Math.floor(surfaceSize.height * devicePixelRatio);
    canvas.style.width = `${surfaceSize.width}px`;
    canvas.style.height = `${surfaceSize.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, surfaceSize.width, surfaceSize.height);

    for (const stroke of strokes) {
      drawStroke(ctx, stroke, surfaceSize.width, surfaceSize.height);
    }

    if (draftStroke) {
      drawStroke(ctx, draftStroke, surfaceSize.width, surfaceSize.height);
    }
  }, [draftStroke, strokes, surfaceSize]);

  React.useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      let parsed: WhiteboardMessage | null = null;

      try {
        parsed = JSON.parse(decoder.decode(payload)) as WhiteboardMessage;
      } catch {
        return;
      }

      if (!parsed || parsed.type !== 'whiteboard') {
        return;
      }

      if (parsed.action === 'stroke') {
        const stroke = sanitizeStroke(parsed.stroke);
        if (!stroke) return;

        setStrokes((current) => mergeUniqueStrokes(current, [stroke]));
        return;
      }

      if (parsed.action === 'clear') {
        setDraftStroke(null);
        setStrokes([]);
        return;
      }

      if (
        parsed.action === 'request-sync' &&
        parsed.requester &&
        parsed.requester !== room.localParticipant.identity
      ) {
        void publishSyncState(parsed.requester);
        return;
      }

      if (
        parsed.action === 'sync-state' &&
        parsed.target === room.localParticipant.identity &&
        Array.isArray(parsed.strokes)
      ) {
        const incoming = parsed.strokes
          .map((stroke) => sanitizeStroke(stroke))
          .filter((stroke): stroke is WhiteboardStroke => stroke !== null);

        setStrokes((current) => mergeUniqueStrokes(current, incoming));
      }
    };

    room.on('dataReceived', handleData);
    return () => {
      room.off('dataReceived', handleData);
    };
  }, [publishSyncState, room]);

  React.useEffect(() => {
    const requestSync = () => {
      void publishMessage({
        type: 'whiteboard',
        action: 'request-sync',
        requester: room.localParticipant.identity,
      });
    };

    if (room.state === 'connected') {
      const timer = window.setTimeout(requestSync, 700);
      return () => window.clearTimeout(timer);
    }

    room.on(RoomEvent.Connected, requestSync);
    return () => {
      room.off(RoomEvent.Connected, requestSync);
    };
  }, [publishMessage, room]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getNormalizedPoint = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const surface = surfaceRef.current;
      if (!surface) {
        return null;
      }

      const bounds = surface.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) {
        return null;
      }

      return {
        x: clampUnit((event.clientX - bounds.left) / bounds.width),
        y: clampUnit((event.clientY - bounds.top) / bounds.height),
      };
    },
    [],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (event.button !== 0) {
        return;
      }

      const point = getNormalizedPoint(event);
      if (!point) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      pointerIdRef.current = event.pointerId;

      const stroke: WhiteboardStroke = {
        id: `${room.localParticipant.identity}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        author: room.localParticipant.identity,
        color,
        createdAt: Date.now(),
        points: [point],
        size,
        tool,
      };

      draftStrokeRef.current = stroke;
      setDraftStroke(stroke);
    },
    [color, getNormalizedPoint, room.localParticipant.identity, size, tool],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      const point = getNormalizedPoint(event);
      if (!point) {
        return;
      }

      setDraftStroke((current) => {
        if (!current) {
          return current;
        }

        const lastPoint = current.points[current.points.length - 1];
        if (lastPoint && pointDistance(lastPoint, point) < 0.0025) {
          return current;
        }

        const nextStroke = {
          ...current,
          points: [...current.points, point],
        };

        draftStrokeRef.current = nextStroke;
        return nextStroke;
      });
    },
    [getNormalizedPoint],
  );

  const finishStroke = React.useCallback(async () => {
    pointerIdRef.current = null;

    const activeStroke = draftStrokeRef.current;
    draftStrokeRef.current = null;
    setDraftStroke(null);

    if (!activeStroke || activeStroke.points.length === 0) {
      return;
    }

    const finalizedStroke = {
      ...activeStroke,
      points: reducePoints(activeStroke.points),
    };

    setStrokes((current) => mergeUniqueStrokes(current, [finalizedStroke]));

    await publishMessage({
      type: 'whiteboard',
      action: 'stroke',
      stroke: finalizedStroke,
    });
  }, [publishMessage]);

  const handlePointerUp = React.useCallback(
    async (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      await finishStroke();
    },
    [finishStroke],
  );

  const handlePointerCancel = React.useCallback(
    async (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      await finishStroke();
    },
    [finishStroke],
  );

  const clearBoard = React.useCallback(async () => {
    setDraftStroke(null);
    draftStrokeRef.current = null;
    setStrokes([]);

    await publishMessage({
      type: 'whiteboard',
      action: 'clear',
      actor: room.localParticipant.identity,
    });
  }, [publishMessage, room.localParticipant.identity]);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : styles.overlayClosed}`}
      aria-hidden={!isOpen}
    >
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div className={styles.cluster}>
            <button
              type="button"
              className={`${styles.toolButton} ${
                tool === 'pencil' ? styles.toolButtonActive : ''
              }`}
              onClick={() => setTool('pencil')}
            >
              <FaPencilAlt />
              Pencil
            </button>
            <button
              type="button"
              className={`${styles.toolButton} ${
                tool === 'pen' ? styles.toolButtonActive : ''
              }`}
              onClick={() => setTool('pen')}
            >
              <FaPen />
              Pen
            </button>
            <button
              type="button"
              className={`${styles.toolButton} ${
                tool === 'marker' ? styles.toolButtonActive : ''
              }`}
              onClick={() => setTool('marker')}
            >
              <FaHighlighter />
              Marker
            </button>
          </div>

          <div className={styles.cluster}>
            <label className={styles.sizeControl}>
              <span>Size</span>
              <input
                type="range"
                min="2"
                max="18"
                step="1"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
              <strong>{size}</strong>
            </label>

            <div className={styles.colors}>
              {BOARD_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  className={`${styles.colorSwatch} ${
                    color.toLowerCase() === swatch.toLowerCase() ? styles.colorSwatchActive : ''
                  }`}
                  style={{ backgroundColor: swatch }}
                  onClick={() => setColor(swatch)}
                  aria-label={`Set color ${swatch}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className={styles.colorPicker}
                aria-label="Choose custom color"
              />
            </div>

            <button type="button" className={styles.actionButton} onClick={clearBoard}>
              <FaTrashAlt />
              Clear
            </button>
            <button type="button" className={styles.actionButton} onClick={onClose}>
              <FaTimes />
              Close
            </button>
          </div>
        </div>

        <div ref={surfaceRef} className={styles.surface}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        </div>
      </section>
    </div>
  );
}
