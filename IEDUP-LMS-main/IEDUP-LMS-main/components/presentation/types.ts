export type PresentationTool = 'pencil' | 'pen' | 'marker' | 'eraser' | 'text';

export type PresentationPage =
  | { id: string; kind: 'pdf'; pdfPageNumber: number }
  | { id: string; kind: 'blank' };

export type PresentationPoint = { x: number; y: number };

export type PresentationStroke = {
  id: string;
  pageId: string;
  author: string;
  color: string;
  createdAt: number;
  points: PresentationPoint[];
  size: number;
  tool: Exclude<PresentationTool, 'text'>;
};

export type PresentationText = {
  id: string;
  pageId: string;
  author: string;
  color: string;
  createdAt: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
};

export type PresentationState = {
  url: string;
  pages: PresentationPage[];
  currentPageId: string;
  strokes: PresentationStroke[];
  texts: PresentationText[];
};

export type PresentationMessage =
  | { type: 'presentation'; action: 'request-sync'; requester: string }
  | { type: 'presentation'; action: 'sync-state'; target: string; state: PresentationState }
  | { type: 'presentation'; action: 'set-document'; state: PresentationState }
  | { type: 'presentation'; action: 'set-current'; pageId: string }
  | { type: 'presentation'; action: 'add-blank'; afterPageId: string | null; page: PresentationPage }
  | { type: 'presentation'; action: 'remove-page'; pageId: string }
  | { type: 'presentation'; action: 'stroke'; stroke: PresentationStroke }
  | { type: 'presentation'; action: 'erase'; stroke: PresentationStroke }
  | { type: 'presentation'; action: 'text'; item: PresentationText }
  | { type: 'presentation'; action: 'clear-page'; pageId: string };
