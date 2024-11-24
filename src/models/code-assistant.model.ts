import mongoose, { model, Schema } from 'mongoose';
import { ICodeAssistantConversation } from '../types/conversations.types';

const codeAssistantSchema = new Schema<ICodeAssistantConversation>(
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

export const CodeAssistant = model<ICodeAssistantConversation>(
  'CodeAssistant',
  codeAssistantSchema,
);
