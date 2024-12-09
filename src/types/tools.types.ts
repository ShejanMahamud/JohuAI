import mongoose from 'mongoose';

export interface IResponse {
  text?: string;
  image?: string;
  file?: string;
  json?: Record<string, unknown>;
}

export interface ITools {
  toolId:
    | 'bg-removal'
    | 'translate-audio'
    | 'transcribe-audio'
    | 'sketch-to-image'
    | 'text-to-image'
    | 'ai-detector'
    | 'code-generator'
    | 'text-to-speech';
  user: mongoose.Schema.Types.ObjectId;
  response: IResponse;
  prompt?: string;
  meta?: Record<string, unknown>;
}
