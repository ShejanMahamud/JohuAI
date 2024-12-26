import mongoose from 'mongoose';

export interface IAiAssistantMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IAiAssistant {
  title: string;
  botId: 'code-assistant' | 'ai-assistant';
  user: mongoose.Schema.Types.ObjectId;
  messages: IAiAssistantMessage[];
  meta: {
    model?: string;
    tone?:
      | 'professional'
      | 'friendly'
      | 'neutral'
      | 'casual'
      | 'humorous'
      | 'sarcastic'
      | 'happy'
      | 'sad'
      | 'calm'
      | 'energetic';
    language?: string;
  };
}
