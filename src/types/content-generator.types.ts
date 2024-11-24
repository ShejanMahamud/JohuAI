import mongoose from 'mongoose';

export interface IContentGeneratorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IContentGeneratorConversation {
  title: string;
  user: mongoose.Schema.Types.ObjectId;
  messages: IContentGeneratorMessage[];
}
