import mongoose, { model, Schema } from 'mongoose';
import { ITools } from '../types/tools.types';

const toolsSchema = new Schema<ITools>({
  toolId: {
    type: String,
    enum: [
      'bg-removal',
      'translate-audio',
      'transcribe-audio',
      'sketch-to-image',
      'text-to-image',
      'ai-detector',
      'code-generator',
      'text-to-speech',
    ],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  response: {
    text: { type: String },
    image: { type: String },
    file: { type: String },
    json: { type: Schema.Types.Mixed },
  },
  meta: { type: Schema.Types.Mixed },
});

export const Tools = model<ITools>('Tools', toolsSchema);
