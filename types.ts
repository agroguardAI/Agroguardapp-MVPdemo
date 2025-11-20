export type Language = 'en' | 'ha' | 'ig' | 'yo' | 'sw';

export interface AnalysisResult {
  name: string;
  scientificName: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  affectedCrops: string[];
  symptoms: string[];
  treatments: string[];
  prevention: string[];
  confidence: number;
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MapResult {
  text: string;
  places: Array<{
    title: string;
    uri: string;
  }>;
}

export enum Tab {
  DIAGNOSE = 'DIAGNOSE',
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  MAPS = 'MAPS',
  EDITOR = 'EDITOR',
  DASHBOARD = 'DASHBOARD'
}

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  farmLocation: string;
  farmSize: string;
  crops: string;
}