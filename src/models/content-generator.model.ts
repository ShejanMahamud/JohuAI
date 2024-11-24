import mongoose, { model, Schema } from 'mongoose';
import { IContentGeneratorConversation } from '../types/content-generator.types';

const contentGeneratorSchema = new Schema<IContentGeneratorConversation>(
  {
    title: { type: String, required: false },
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
        content: { type: Schema.Types.Mixed, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

export const ContentGenerator = model<IContentGeneratorConversation>(
  'ContentGenerator',
  contentGeneratorSchema,
);
