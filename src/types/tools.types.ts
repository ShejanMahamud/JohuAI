import mongoose from 'mongoose';

export interface IMessage {
  text?: string;
  image?: string;
}

export interface ITools {
  toolId:
    | 'bg-removal'
    | 'translate-audio'
    | 'transcribe-audio'
    | 'sketch-to-image'
    | 'text-to-image';
  user: mongoose.Schema.Types.ObjectId;
  message: IMessage;
  prompt?: string;
}
