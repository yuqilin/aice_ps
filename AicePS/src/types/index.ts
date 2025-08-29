export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  name?: string;
}

export interface EditHistory {
  id: string;
  uri: string;
  operation: string;
  timestamp: number;
}

export type EditTab = 'retouch' | 'adjust' | 'filters' | 'crop' | 'fusion' | 'texture' | 'erase';

export type View = 'editor' | 'past-forward' | 'start';

export interface RetouchHotspot {
  x: number;
  y: number;
}

export interface LastAction {
  type: EditTab;
  prompt?: string;
  hotspot?: RetouchHotspot;
  sourceImages?: ImageAsset[];
}

export interface FilterSuggestion {
  name: string;
  prompt: string;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AspectRatio {
  name: string;
  value: number | null; // null for free crop
}