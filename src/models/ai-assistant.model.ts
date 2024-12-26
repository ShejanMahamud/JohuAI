import mongoose, { model, Schema } from 'mongoose';
import { IAiAssistant } from '../types/ai-assistant.types';

const aiAssistantSchema = new Schema<IAiAssistant>(
  {
    botId: {
      type: String,
      enum: ['code-assistant', 'ai-assistant'],
      required: true,
    },
    title: { type: String, default: null },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['system', 'user', 'assistant'],
          required: true,
        },
        content: { type: String, required: true },
        _id: false,
      },
    ],
    meta: {
      model: { type: String },
      tone: { type: String },
      language: { type: String },
    },
  },
  { timestamps: true },
);

export const AiAssistantModel = model<IAiAssistant>(
  'AiAssistant',
  aiAssistantSchema,
);
