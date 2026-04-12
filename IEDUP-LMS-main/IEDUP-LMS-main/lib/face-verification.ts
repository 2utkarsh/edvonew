import { withBasePath } from '@/lib/url';

const FACE_CAPTURE_SIZE = 64;
const FACE_BLOCKS_PER_SIDE = 8;
const DEFAULT_FACE_DETECTOR_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const MEDIA_PIPE_WASM_PATH = withBasePath('/face-verification/wasm');
const MEDIA_PIPE_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';
const MEDIA_PIPE_ENGINE = 'mediapipe-face-detector-v1';
const BROWSER_ENGINE = 'browser-face-detector-v1';

type MediaPipeBoundingBox = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

type MediaPipeFaceDetector = {
  detectForVideo(
    videoFrame: HTMLVideoElement,
    timestamp: number,
  ): {
    detections: Array<{
      boundingBox?: MediaPipeBoundingBox;
    }>;
  };
};

export type FaceReferenceSource = 'participant-login' | 'room-reference';

export type StoredFaceReference = {
  signature: number[];
  capturedAt: string;
  source: FaceReferenceSource;
  engine: string;
  participantId?: string;
  participantEmail?: string;
  participantName?: string;
};

export type FaceSignatureResult =
  | {
      ok: true;
      signature: number[];
      engine: string;
    }
  | {
      ok: false;
      reason: string;
      engine?: string;
    };

export const FACE_REFERENCE_STORAGE_KEY = 'participantFaceReference';
export const FACE_MATCH_THRESHOLD = 0.72;

let mediaPipeDetectorPromise: Promise<MediaPipeFaceDetector | null> | null = null;
let browserDetectorPromise: Promise<FaceDetectorInstance | null> | null = null;
let lastMediaPipeInitError = '';

function normalizeBoundingBox(bounds: { x: number; y: number; width: number; height: number }, width: number, height: number) {
  const x = Math.max(0, Math.floor(bounds.x));
  const y = Math.max(0, Math.floor(bounds.y));
  const boxWidth = Math.min(width - x, Math.ceil(bounds.width));
  const boxHeight = Math.min(height - y, Math.ceil(bounds.height));

  return {
    x,
    y,
    width: Math.max(1, boxWidth),
    height: Math.max(1, boxHeight),
  };
}

function createFaceSignature(data: Uint8ClampedArray) {
  const blockSize = FACE_CAPTURE_SIZE / FACE_BLOCKS_PER_SIDE;
  const values: number[] = [];

  for (let blockY = 0; blockY < FACE_BLOCKS_PER_SIDE; blockY += 1) {
    for (let blockX = 0; blockX < FACE_BLOCKS_PER_SIDE; blockX += 1) {
      let total = 0;
      let count = 0;

      for (let y = 0; y < blockSize; y += 1) {
        for (let x = 0; x < blockSize; x += 1) {
          const pixelX = blockX * blockSize + x;
          const pixelY = blockY * blockSize + y;
          const index = (pixelY * FACE_CAPTURE_SIZE + pixelX) * 4;
          total += data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
          count += 1;
        }
      }

      values.push(total / Math.max(1, count));
    }
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  const centered = values.map((value) => value - mean);
  const magnitude = Math.sqrt(centered.reduce((sum, value) => sum + value * value, 0)) || 1;

  return centered.map((value) => value / magnitude);
}

function drawFaceSignature(
  video: HTMLVideoElement,
  bounds: { x: number; y: number; width: number; height: number },
): FaceSignatureResult {
  const normalizedBounds = normalizeBoundingBox(bounds, video.videoWidth, video.videoHeight);
  const canvas = document.createElement('canvas');
  canvas.width = FACE_CAPTURE_SIZE;
  canvas.height = FACE_CAPTURE_SIZE;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return {
      ok: false,
      reason: 'Unable to read camera frames.',
    };
  }

  context.drawImage(
    video,
    normalizedBounds.x,
    normalizedBounds.y,
    normalizedBounds.width,
    normalizedBounds.height,
    0,
    0,
    FACE_CAPTURE_SIZE,
    FACE_CAPTURE_SIZE,
  );

  const imageData = context.getImageData(0, 0, FACE_CAPTURE_SIZE, FACE_CAPTURE_SIZE);

  return {
    ok: true,
    signature: createFaceSignature(imageData.data),
    engine: '',
  };
}

async function createMediaPipeDetector() {
  const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const modelAssetPath =
    process.env.NEXT_PUBLIC_FACE_DETECTOR_MODEL_URL || DEFAULT_FACE_DETECTOR_MODEL_URL;
  const wasmPath =
    process.env.NEXT_PUBLIC_FACE_WASM_PATH ||
    (process.env.NODE_ENV === 'production' ? MEDIA_PIPE_WASM_CDN : MEDIA_PIPE_WASM_PATH);

  const tryCreate = async (basePath: string) => {
    const fileset = await FilesetResolver.forVisionTasks(basePath);
    return FaceDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath,
      },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.6,
    }) as Promise<MediaPipeFaceDetector>;
  };

  try {
    return await tryCreate(wasmPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load MediaPipe wasm assets.';
    lastMediaPipeInitError = `MediaPipe init failed at ${wasmPath}: ${message}`;
    return await tryCreate(MEDIA_PIPE_WASM_CDN);
  }
}

async function getMediaPipeDetector() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!mediaPipeDetectorPromise) {
    mediaPipeDetectorPromise = createMediaPipeDetector().catch((error) => {
      lastMediaPipeInitError =
        error instanceof Error ? error.message : 'Unable to initialize MediaPipe face detection.';
      return null;
    });
  }

  return mediaPipeDetectorPromise;
}

async function getBrowserDetector() {
  if (typeof window === 'undefined' || !window.FaceDetector) {
    return null;
  }

  if (!browserDetectorPromise) {
    browserDetectorPromise = Promise.resolve(
      new window.FaceDetector({
        fastMode: true,
        maxDetectedFaces: 1,
      }),
    );
  }

  return browserDetectorPromise;
}

async function detectWithMediaPipe(video: HTMLVideoElement): Promise<FaceSignatureResult> {
  const detector = await getMediaPipeDetector();
  if (!detector) {
    return {
      ok: false,
      reason: lastMediaPipeInitError || 'MediaPipe face detection is unavailable.',
      engine: MEDIA_PIPE_ENGINE,
    };
  }

  const detectionResult = detector.detectForVideo(video, performance.now());
  const detections = detectionResult.detections || [];

  if (!detections.length) {
    return {
      ok: false,
      reason: 'No face detected.',
      engine: MEDIA_PIPE_ENGINE,
    };
  }

  if (detections.length > 1) {
    return {
      ok: false,
      reason: 'Only one face should be visible.',
      engine: MEDIA_PIPE_ENGINE,
    };
  }

  const bounds = detections[0].boundingBox;
  if (!bounds) {
    return {
      ok: false,
      reason: 'Unable to locate the face.',
      engine: MEDIA_PIPE_ENGINE,
    };
  }

  const signature = drawFaceSignature(video, {
    x: bounds.originX,
    y: bounds.originY,
    width: bounds.width,
    height: bounds.height,
  });

  return signature.ok
    ? {
        ...signature,
        engine: MEDIA_PIPE_ENGINE,
      }
    : {
        ...signature,
        engine: MEDIA_PIPE_ENGINE,
      };
}

async function detectWithBrowser(video: HTMLVideoElement): Promise<FaceSignatureResult> {
  const detector = await getBrowserDetector();
  if (!detector) {
    return {
      ok: false,
      reason: 'Face detection is not available in this browser.',
    };
  }

  const faces = await detector.detect(video);

  if (!faces.length) {
    return {
      ok: false,
      reason: 'No face detected.',
      engine: BROWSER_ENGINE,
    };
  }

  if (faces.length > 1) {
    return {
      ok: false,
      reason: 'Only one face should be visible.',
      engine: BROWSER_ENGINE,
    };
  }

  const bounds = faces[0].boundingBox;
  const signature = drawFaceSignature(video, {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  });

  return signature.ok
    ? {
        ...signature,
        engine: BROWSER_ENGINE,
      }
    : {
        ...signature,
        engine: BROWSER_ENGINE,
      };
}

export async function detectFaceSignature(video: HTMLVideoElement): Promise<FaceSignatureResult> {
  if (!video.videoWidth || !video.videoHeight) {
    return {
      ok: false,
      reason: 'Camera is not ready.',
    };
  }

  const mediaPipeResult = await detectWithMediaPipe(video);
  if (mediaPipeResult.ok) {
    return mediaPipeResult;
  }

  const browserResult = await detectWithBrowser(video);
  if (browserResult.ok) {
    return browserResult;
  }

  if (mediaPipeResult.reason && mediaPipeResult.engine) {
    return mediaPipeResult;
  }

  if (browserResult.reason && browserResult.engine) {
    return browserResult;
  }

  return {
    ok: false,
    reason: mediaPipeResult.reason || browserResult.reason,
  };
}

export function compareFaceSignatures(reference: number[], current: number[]) {
  return reference.reduce((sum, value, index) => sum + value * (current[index] || 0), 0);
}

export function loadStoredFaceReference() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(FACE_REFERENCE_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed?.signature)) {
      return null;
    }

    return parsed as StoredFaceReference;
  } catch {
    return null;
  }
}

export function saveStoredFaceReference(reference: StoredFaceReference) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FACE_REFERENCE_STORAGE_KEY, JSON.stringify(reference));
}

export function clearStoredFaceReference() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(FACE_REFERENCE_STORAGE_KEY);
}

export function faceReferenceMatchesParticipant(
  reference: StoredFaceReference | null,
  participant: { id?: string; email?: string } | null,
) {
  if (!reference) {
    return false;
  }

  if (!participant) {
    return false;
  }

  if (participant.id && reference.participantId) {
    return participant.id === reference.participantId;
  }

  if (participant.email && reference.participantEmail) {
    return participant.email.toLowerCase() === reference.participantEmail.toLowerCase();
  }

  return true;
}
