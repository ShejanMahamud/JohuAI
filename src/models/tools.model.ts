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
    ],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    text: { type: String },
    image: { type: String },
  },
  prompt: { type: String },
});

export const Tools = model<ITools>('Tools', toolsSchema);
