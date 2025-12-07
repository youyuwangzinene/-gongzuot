export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type Resolution = "1K" | "2K" | "4K"; // Image
export type VideoResolution = "720p" | "1080p"; // Video

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface GeneratedItem {
  id: string;
  type: MediaType;
  url: string;
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  loading?: boolean; // For optimistic UI
}

export interface ImageGenerationParams {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
}

export interface VideoGenerationParams {
  prompt: string;
  aspectRatio: "16:9" | "9:16";
  resolution: VideoResolution;
}