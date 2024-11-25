import mongoose, { model, Schema } from 'mongoose';
import { IBotConversation } from '../types/bot.types';

const botConversationSchema = new Schema<IBotConversation>(
  {
    botId: {
      type: String,
      enum: [
        'code-assistant',
        'text-translator',
        'content-generator',
        'text-summarizer',
      ],
      required: true,
    },
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

export const BotConversation = model<IBotConversation>(
  'BotConversation',
  botConversationSchema,
);
