import mongoose from 'mongoose';

export interface ICodeAssistantMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ICodeAssistantConversation {
  title: string;
  user: mongoose.Schema.Types.ObjectId;
  messages: ICodeAssistantMessage[];
}
