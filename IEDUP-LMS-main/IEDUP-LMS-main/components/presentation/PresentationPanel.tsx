'use client';

import * as React from 'react';
import type { Room, RemoteParticipant } from 'livekit-client';
import { RoomEvent } from 'livekit-client';
import { PDFDocument } from 'pdf-lib';
import styles from './PresentationPanel.module.css';
import type {
  PresentationMessage,
  PresentationPage,
  PresentationState,
  PresentationStroke,
  PresentationText,
  PresentationTool,
} from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PAYLOAD_LIMIT_BYTES = 14_000;

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function reducePoints(points: Array<{ x: number; y: number }>, maxPoints = 220) {
  if (points.length <= maxPoints) return points;
  const reduced: Array<{ x: number; y: number }> = [];
  const lastIndex = points.length - 1;
  const step = lastIndex / (maxPoints - 1);
  for (let index = 0; index < maxPoints; index += 1) {
    const point = points[Math.round(index * step)];
    if (!point) continue;
    const prev = reduced[reduced.length - 1];
    if (!prev || prev.x !== point.x || prev.y !== point.y) reduced.push(point);
  }
  return reduced;
}

const TOOL_CONFIG: Record<
  Exclude<PresentationTool, 'text'>,
  { alpha: number; sizeMultiplier: number; composite: GlobalCompositeOperation }
> = {
  eraser: { alpha: 1, sizeMultiplier: 2.2, composite: 'destination-out' },
  pencil: { alpha: 0.62, sizeMultiplier: 0.85, composite: 'source-over' },
  pen: { alpha: 1, sizeMultiplier: 1, composite: 'source-over' },
  marker: { alpha: 0.3, sizeMultiplier: 1.9, composite: 'source-over' },
};

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: PresentationStroke,
  width: number,
  height: number,
) {
  const settings = TOOL_CONFIG[stroke.tool];
  const lineWidth = Math.max(1, stroke.size * settings.sizeMultiplier);
  const points = stroke.points;
  if (points.length === 0) return;

  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.globalAlpha = settings.alpha;
  ctx.globalCompositeOperation = settings.composite;
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
  for (let i = 1; i < points.length; i += 1) {
    const p = points[i];
    ctx.lineTo(p.x * width, p.y * height);
  }
  ctx.stroke();
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, item: PresentationText, width: number, height: number) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = item.color;
  ctx.font = `700 ${Math.max(10, Math.min(48, item.fontSize))}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textBaseline = 'top';
  ctx.fillText(item.text, item.x * width, item.y * height);
  ctx.restore();
}

async function getPdfPageCount(url: string) {
  // Use legacy build for better bundler compatibility in Next.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjs as any).version}/build/pdf.worker.min.js`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;
  const loadingTask = pdfjs.getDocument(url);
  const doc = await loadingTask.promise;
  return doc.numPages;
}

async function renderPdfPageToCanvas(url: string, pageNumber: number, canvas: HTMLCanvasElement) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjs as any).version}/build/pdf.worker.min.js`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;
  const loadingTask = pdfjs.getDocument(url);
  const doc = await loadingTask.promise;
  const page = await doc.getPage(pageNumber);

  const containerWidth = canvas.parentElement?.clientWidth ?? 900;
  const viewport1 = page.getViewport({ scale: 1 });
  const scale = Math.max(0.5, Math.min(2.2, (containerWidth - 24) / viewport1.width));
  const viewport = page.getViewport({ scale });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
}

function buildInitialPages(numPages: number): PresentationPage[] {
  const pages: PresentationPage[] = [];
  for (let i = 1; i <= numPages; i += 1) {
    pages.push({ id: `pdf-${i}`, kind: 'pdf', pdfPageNumber: i });
  }
  return pages;
}

function safeParseMessage(payload: Uint8Array): PresentationMessage | null {
  try {
    const parsed = JSON.parse(decoder.decode(payload));
    if (!parsed || parsed.type !== 'presentation') return null;
    return parsed as PresentationMessage;
  } catch {
    return null;
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Props = {
  room: Room;
  isHost: boolean;
  selectedFile: File | null;
  onSelectedFileChange: (file: File | null) => void;
  onOpenChange?: (open: boolean) => void;
};

export default function PresentationPanel({
  room,
  isHost,
  selectedFile,
  onSelectedFileChange,
  onOpenChange,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [state, setState] = React.useState<PresentationState | null>(null);

  const pageCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pointerIdRef = React.useRef<number | null>(null);
  const draftStrokeRef = React.useRef<PresentationStroke | null>(null);

  const [tool, setTool] = React.useState<PresentationTool>('pen');
  const [size, setSize] = React.useState(6);
  const [color, setColor] = React.useState('#111827');

  const currentPage = React.useMemo(() => {
    if (!state) return null;
    return state.pages.find((p) => p.id === state.currentPageId) ?? null;
  }, [state]);

  const currentIndex = React.useMemo(() => {
    if (!state) return -1;
    return state.pages.findIndex((p) => p.id === state.currentPageId);
  }, [state]);

  const redrawOverlay = React.useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay || !state) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    const { width, height } = overlay;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pageId = state.currentPageId;
    for (const stroke of state.strokes) {
      if (stroke.pageId !== pageId) continue;
      drawStroke(ctx, stroke, width, height);
    }
    for (const item of state.texts) {
      if (item.pageId !== pageId) continue;
      drawText(ctx, item, width, height);
    }
  }, [state]);

  const ensureOverlaySizedToPage = React.useCallback(() => {
    const overlay = overlayCanvasRef.current;
    const pageCanvas = pageCanvasRef.current;
    if (!overlay || !pageCanvas) return;
    if (overlay.width !== pageCanvas.width || overlay.height !== pageCanvas.height) {
      overlay.width = pageCanvas.width;
      overlay.height = pageCanvas.height;
    }
  }, []);

  const renderCurrent = React.useCallback(async () => {
    if (!state || !currentPage) return;
    const pageCanvas = pageCanvasRef.current;
    if (!pageCanvas) return;

    if (currentPage.kind === 'blank') {
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) return;
      const w = pageCanvas.parentElement?.clientWidth ?? 900;
      const width = Math.floor(Math.min(900, w - 24));
      const height = Math.floor(width * 1.28);
      pageCanvas.width = width;
      pageCanvas.height = height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      await renderPdfPageToCanvas(state.url, currentPage.pdfPageNumber, pageCanvas);
    }

    ensureOverlaySizedToPage();
    redrawOverlay();
  }, [currentPage, ensureOverlaySizedToPage, redrawOverlay, state]);

  React.useEffect(() => {
    if (!open) return;
    void renderCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, state?.currentPageId]);

  React.useEffect(() => {
    if (!open) return;
    const onResize = () => void renderCurrent();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, renderCurrent]);

  const publish = React.useCallback(
    async (msg: PresentationMessage, destinationIdentities?: string[]) => {
      const bytes = encoder.encode(JSON.stringify(msg));
      if (bytes.byteLength > PAYLOAD_LIMIT_BYTES) return;
      await room.localParticipant.publishData(bytes, {
        reliable: true,
        destinationIdentities,
      });
    },
    [room],
  );

  const broadcastState = React.useCallback(
    async (next: PresentationState) => {
      await publish({ type: 'presentation', action: 'set-document', state: next });
    },
    [publish],
  );

  const openPresentation = React.useCallback(
    async (next: PresentationState) => {
      setState(next);
      setOpen(true);
      await broadcastState(next);
    },
    [broadcastState],
  );

  const handleUploadAndStart = React.useCallback(async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.set('file', selectedFile);
      form.set('roomName', room.name);

      // Respect NEXT_PUBLIC_BASE_PATH (e.g. /live) via shared URL helper.
      const { apiUrl } = await import('@/lib/url');
      const response = await fetch(apiUrl('/api/presentation/upload'), { method: 'POST', body: form });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = (await response.json()) as { url: string };
      const count = await getPdfPageCount(data.url);
      const pages = buildInitialPages(count);
      const initial: PresentationState = {
        url: data.url,
        pages,
        currentPageId: pages[0]?.id ?? 'pdf-1',
        strokes: [],
        texts: [],
      };
      await openPresentation(initial);
    } finally {
      setLoading(false);
    }
  }, [openPresentation, room.name, selectedFile]);

  const setCurrent = React.useCallback(
    async (pageId: string) => {
      if (!state) return;
      const next: PresentationState = { ...state, currentPageId: pageId };
      setState(next);
      await publish({ type: 'presentation', action: 'set-current', pageId });
    },
    [publish, state],
  );

  const addBlankAfter = React.useCallback(
    async (afterPageId: string | null) => {
      if (!state) return;
      const page: PresentationPage = { id: nowId('blank'), kind: 'blank' };
      const pages = [...state.pages];
      const index = afterPageId ? pages.findIndex((p) => p.id === afterPageId) : pages.length - 1;
      pages.splice(index + 1, 0, page);
      const next: PresentationState = { ...state, pages };
      setState(next);
      await publish({ type: 'presentation', action: 'add-blank', afterPageId, page });
    },
    [publish, state],
  );

  const removePage = React.useCallback(
    async (pageId: string) => {
      if (!state) return;
      const pages = state.pages.filter((p) => p.id !== pageId);
      if (pages.length === 0) return;
      const nextCurrent = state.currentPageId === pageId ? pages[Math.max(0, currentIndex - 1)].id : state.currentPageId;
      const next: PresentationState = {
        ...state,
        pages,
        currentPageId: nextCurrent,
        strokes: state.strokes.filter((s) => s.pageId !== pageId),
        texts: state.texts.filter((t) => t.pageId !== pageId),
      };
      setState(next);
      await publish({ type: 'presentation', action: 'remove-page', pageId });
    },
    [currentIndex, publish, state],
  );

  const clearCurrentPage = React.useCallback(async () => {
    if (!state) return;
    const pageId = state.currentPageId;
    const next: PresentationState = {
      ...state,
      strokes: state.strokes.filter((s) => s.pageId !== pageId),
      texts: state.texts.filter((t) => t.pageId !== pageId),
    };
    setState(next);
    await publish({ type: 'presentation', action: 'clear-page', pageId });
  }, [publish, state]);

  const addTextAt = React.useCallback(
    async (x: number, y: number) => {
      if (!state) return;
      const text = window.prompt('Type text');
      if (!text) return;
      const item: PresentationText = {
        id: nowId('text'),
        pageId: state.currentPageId,
        author: room.localParticipant.identity,
        color,
        createdAt: Date.now(),
        x: clampUnit(x),
        y: clampUnit(y),
        text,
        fontSize: 22,
      };
      const next: PresentationState = { ...state, texts: [...state.texts, item] };
      setState(next);
      await publish({ type: 'presentation', action: 'text', item });
    },
    [color, publish, room.localParticipant.identity, state],
  );

  const pointerToUnit = React.useCallback((ev: PointerEvent) => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return null;
    const rect = overlay.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;
    return { x: clampUnit(x), y: clampUnit(y) };
  }, []);

  const onPointerDown = React.useCallback(
    (ev: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isHost || !state) return;
      if (!overlayCanvasRef.current) return;
      if (ev.button !== 0) return;
      const overlay = overlayCanvasRef.current;
      overlay.setPointerCapture(ev.pointerId);
      pointerIdRef.current = ev.pointerId;

      const unit = pointerToUnit(ev.nativeEvent);
      if (!unit) return;

      if (tool === 'text') {
        void addTextAt(unit.x, unit.y);
        return;
      }

      const strokeTool = tool as Exclude<PresentationTool, 'text'>;
      const stroke: PresentationStroke = {
        id: nowId('stroke'),
        pageId: state.currentPageId,
        author: room.localParticipant.identity,
        color,
        createdAt: Date.now(),
        points: [unit],
        size,
        tool: strokeTool,
      };
      draftStrokeRef.current = stroke;
    },
    [addTextAt, color, isHost, pointerToUnit, room.localParticipant.identity, size, state, tool],
  );

  const onPointerMove = React.useCallback((ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isHost) return;
    if (pointerIdRef.current !== ev.pointerId) return;
    const draft = draftStrokeRef.current;
    if (!draft) return;
    const unit = pointerToUnit(ev.nativeEvent);
    if (!unit) return;
    draft.points.push(unit);

    // optimistic draw
    const overlay = overlayCanvasRef.current;
    const ctx = overlay?.getContext('2d');
    if (ctx && overlay) {
      drawStroke(ctx, draft, overlay.width, overlay.height);
    }
  }, [isHost, pointerToUnit]);

  const onPointerUp = React.useCallback(
    async (ev: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isHost) return;
      if (pointerIdRef.current !== ev.pointerId) return;
      pointerIdRef.current = null;
      const draft = draftStrokeRef.current;
      draftStrokeRef.current = null;
      if (!draft || !state) return;
      draft.points = reducePoints(draft.points);
      const next: PresentationState = { ...state, strokes: [...state.strokes, draft] };
      setState(next);
      await publish({ type: 'presentation', action: 'stroke', stroke: draft });
    },
    [isHost, publish, state],
  );

  const handleDownload = React.useCallback(async () => {
    if (!state) return;
    setLoading(true);
    try {
      const originalBytes = await fetch(state.url).then((r) => r.arrayBuffer());
      const originalPdf = await PDFDocument.load(originalBytes);
      const outPdf = await PDFDocument.create();

      const firstPage = originalPdf.getPage(0);
      const defaultSize = { width: firstPage.getWidth(), height: firstPage.getHeight() };

      for (const page of state.pages) {
        let outPage;
        if (page.kind === 'pdf') {
          const [copied] = await outPdf.copyPages(originalPdf, [page.pdfPageNumber - 1]);
          outPdf.addPage(copied);
          outPage = copied;
        } else {
          outPage = outPdf.addPage([defaultSize.width, defaultSize.height]);
        }

        // Render overlay for this page into an image by drawing into a temp canvas.
        const tmp = document.createElement('canvas');
        tmp.width = 1400;
        tmp.height = Math.floor((tmp.width * defaultSize.height) / defaultSize.width);
        const ctx = tmp.getContext('2d');
        if (!ctx) continue;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tmp.width, tmp.height);

        for (const stroke of state.strokes) {
          if (stroke.pageId !== page.id) continue;
          drawStroke(ctx, stroke, tmp.width, tmp.height);
        }
        for (const item of state.texts) {
          if (item.pageId !== page.id) continue;
          drawText(ctx, item, tmp.width, tmp.height);
        }

        const pngDataUrl = tmp.toDataURL('image/png');
        const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
        const png = await outPdf.embedPng(pngBytes);
        outPage.drawImage(png, {
          x: 0,
          y: 0,
          width: outPage.getWidth(),
          height: outPage.getHeight(),
        });
      }

      const bytes = await outPdf.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `presentation-${room.name}.pdf`);
    } finally {
      setLoading(false);
    }
  }, [room.name, state]);

  const handleIncoming = React.useCallback(
    async (payload: Uint8Array, participant?: RemoteParticipant) => {
      const msg = safeParseMessage(payload);
      if (!msg) return;

      if (msg.action === 'request-sync' && isHost) {
        if (!state) return;
        await publish(
          { type: 'presentation', action: 'sync-state', target: msg.requester, state },
          [msg.requester],
        );
        return;
      }

      if (msg.action === 'sync-state') {
        if (msg.target !== room.localParticipant.identity) return;
        setState(msg.state);
        setOpen(true);
        return;
      }

      if (msg.action === 'set-document') {
        setState(msg.state);
        setOpen(true);
        return;
      }

      if (!state) return;

      if (msg.action === 'set-current') {
        setState((current) => (current ? { ...current, currentPageId: msg.pageId } : current));
      } else if (msg.action === 'add-blank') {
        setState((current) => {
          if (!current) return current;
          const pages = [...current.pages];
          const idx = msg.afterPageId ? pages.findIndex((p) => p.id === msg.afterPageId) : pages.length - 1;
          pages.splice(idx + 1, 0, msg.page);
          return { ...current, pages };
        });
      } else if (msg.action === 'remove-page') {
        setState((current) => {
          if (!current) return current;
          const pages = current.pages.filter((p) => p.id !== msg.pageId);
          const currentPageId = pages.some((p) => p.id === current.currentPageId)
            ? current.currentPageId
            : pages[0]?.id ?? current.currentPageId;
          return {
            ...current,
            pages,
            currentPageId,
            strokes: current.strokes.filter((s) => s.pageId !== msg.pageId),
            texts: current.texts.filter((t) => t.pageId !== msg.pageId),
          };
        });
      } else if (msg.action === 'clear-page') {
        setState((current) => {
          if (!current) return current;
          return {
            ...current,
            strokes: current.strokes.filter((s) => s.pageId !== msg.pageId),
            texts: current.texts.filter((t) => t.pageId !== msg.pageId),
          };
        });
      } else if (msg.action === 'stroke') {
        setState((current) => (current ? { ...current, strokes: [...current.strokes, msg.stroke] } : current));
      } else if (msg.action === 'text') {
        setState((current) => (current ? { ...current, texts: [...current.texts, msg.item] } : current));
      }
    },
    [isHost, publish, room.localParticipant.identity, state],
  );

  React.useEffect(() => {
    room.on('dataReceived', handleIncoming);
    return () => {
      room.off('dataReceived', handleIncoming);
    };
  }, [handleIncoming, room]);

  // Participant requests sync when they join and host already has presentation.
  React.useEffect(() => {
    if (isHost) return;
    if (state) return;
    const onConnected = async () => {
      await publish({ type: 'presentation', action: 'request-sync', requester: room.localParticipant.identity });
    };
    room.on(RoomEvent.Connected, onConnected);
    return () => {
      room.off(RoomEvent.Connected, onConnected);
    };
  }, [isHost, publish, room, state]);

  React.useEffect(() => {
    if (!open || !state) return;
    void renderCurrent();
  }, [open, renderCurrent, state]);

  React.useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  if (!isHost && !open) return null;

  return (
    <div className={styles.panel} style={{ display: open ? 'grid' : 'none' }}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Presentation</div>
          {state ? (
            <div className={styles.hint}>
              Page {Math.max(1, currentIndex + 1)} / {state.pages.length}
            </div>
          ) : (
            <div className={styles.hint}>No presentation loaded</div>
          )}
        </div>
        <div className={styles.headerActions}>
          {isHost && (
            <>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={handleUploadAndStart}
                disabled={!selectedFile || loading}
                title="Upload PDF and start presentation"
              >
                {loading ? 'Loading…' : 'Start'}
              </button>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={handleDownload}
                disabled={!state || loading}
                title="Download annotated PDF"
              >
                Download
              </button>
            </>
          )}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => setOpen(false)}
            title="Close"
          >
            Close
          </button>
        </div>
      </div>

      <div className={styles.viewer}>
        <div className={styles.canvasWrap}>
          <canvas ref={pageCanvasRef} className={styles.pageCanvas} />
          <canvas
            ref={overlayCanvasRef}
            className={styles.overlayCanvas}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => state && setCurrent(state.pages[Math.max(0, currentIndex - 1)].id)}
            disabled={!state || currentIndex <= 0}
          >
            Prev
          </button>
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => state && setCurrent(state.pages[Math.min(state.pages.length - 1, currentIndex + 1)].id)}
            disabled={!state || currentIndex >= (state?.pages.length ?? 0) - 1}
          >
            Next
          </button>
          {isHost && (
            <>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => addBlankAfter(state ? state.currentPageId : null)}
                disabled={!state}
                title="Insert blank page after current"
              >
                + Blank
              </button>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => state && removePage(state.currentPageId)}
                disabled={!state || (state?.pages.length ?? 0) <= 1}
                title="Remove current page"
              >
                Remove
              </button>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={clearCurrentPage}
                disabled={!state}
                title="Clear drawings on current page"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {isHost ? (
          <div className={styles.toolRow}>
            <select
              className={styles.select}
              value={tool}
              onChange={(e) => setTool(e.target.value as PresentationTool)}
            >
              <option value="pen">Pen</option>
              <option value="pencil">Pencil</option>
              <option value="marker">Marker</option>
              <option value="eraser">Eraser</option>
              <option value="text">Text</option>
            </select>
            <select
              className={styles.select}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              title="Brush size"
            >
              {[3, 5, 7, 10, 14, 18, 24].map((v) => (
                <option key={v} value={v}>
                  {v}px
                </option>
              ))}
            </select>
            <input
              className={styles.select}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              title="Color"
              style={{ padding: 0, width: 42 }}
            />
            <span className={styles.pill} title="PDF chosen for presentation">
              PDF: {selectedFile?.name ?? 'Not selected'}
            </span>
          </div>
        ) : (
          <div className={styles.hint}>Host is presenting</div>
        )}
      </div>
    </div>
  );
}
