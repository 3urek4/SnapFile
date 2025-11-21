export interface SnapFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // Base64 data for this demo
  preview?: string;
}

export interface TransferSession {
  code: string;
  files: SnapFile[];
  expiresAt: number;
  summary?: string; // AI generated summary
}

export enum AppMode {
  HOME = 'HOME',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
}

export enum UploadStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // AI Analysis
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface StorageResponse {
  success: boolean;
  code?: string;
  session?: TransferSession;
  error?: string;
}