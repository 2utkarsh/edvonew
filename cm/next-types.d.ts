declare module 'next/types.js' {
  export type ResolvingMetadata = import('next').ResolvingMetadata;
  export type ResolvingViewport = import('next').ResolvingViewport;
}

declare module 'next' {
  export type Metadata = any;
  export type Viewport = any;
}

declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
    };
  }

  export class NextResponse extends Response {
    static json(body?: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    cookies: {
      set(name: string, value: string, options?: any): void;
      get(name: string): { name: string; value: string } | undefined;
      delete(name: string): void;
    };
  }
}

declare module 'next/server.js' {
  export { NextRequest, NextResponse } from 'next/server';
}

declare module 'next/headers' {
  export function cookies(): any;
  export function headers(): any;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
  };
}

type DetectedFace = {
  boundingBox: DOMRectReadOnly;
};

type FaceDetectorOptions = {
  fastMode?: boolean;
  maxDetectedFaces?: number;
};

type FaceDetectorInstance = {
  detect(input: ImageBitmapSource): Promise<DetectedFace[]>;
};

interface Window {
  FaceDetector?: {
    new (options?: FaceDetectorOptions): FaceDetectorInstance;
  };
}
