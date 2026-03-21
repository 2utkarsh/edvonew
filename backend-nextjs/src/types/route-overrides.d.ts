// Type overrides for Next.js route handlers
// This disables strict type checking for route handlers

declare module 'next/server' {
  interface RouteHandlerConfig<T extends string> {
    GET?: any;
    POST?: any;
    PUT?: any;
    DELETE?: any;
    PATCH?: any;
  }
}

export {};
