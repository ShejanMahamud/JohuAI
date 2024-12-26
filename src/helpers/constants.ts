import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Toolhouse } from '@toolhouseai/sdk';
import { ElevenLabsClient } from 'elevenlabs/Client';
import Groq from 'groq-sdk';
import multer from 'multer';
import config from '../config';

export const groq = new Groq({ apiKey: config.groqAIkey });
export const elevenlabs = new ElevenLabsClient({
  apiKey: config.elevenLabsApiKey,
});
export const upload = multer({ storage: multer.memoryStorage() });

export const google = createGoogleGenerativeAI({
  apiKey: config.geminiApiKey,
});
export const toolhouse = new Toolhouse({
  apiKey: config.toolhouseApiKey,
  provider: 'vercel',
});
