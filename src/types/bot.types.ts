import mongoose from 'mongoose';

export interface IBotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IBotConversation {
  title: string;
  botId:
    | 'code-assistant'
    | 'text-translator'
    | 'content-generator'
    | 'text-summarizer';
  user: mongoose.Schema.Types.ObjectId;
  messages: IBotMessage[];
}
