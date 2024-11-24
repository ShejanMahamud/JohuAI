import cors from 'cors';
import type { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import fs from 'fs';
import Groq from 'groq-sdk';
import path from 'path';
import { ZodError } from 'zod';
import config from '../config';
import conversationRoutes from '../routes/code-assistant.routes';
import userRoutes from '../routes/user.routes';
import { ErrorWithStatus } from '../types/types';
import { CustomError } from '../utils/customError';
export const groq = new Groq({ apiKey: config.groqAIkey });
const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: [config.clientUrl || ''],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is Running! 🏃' });
});

app.get('/audio', async (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), './src/app/6231.mp3');
  const translation = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath), // Required path to audio file - replace with your audio file!
    model: 'whisper-large-v3', // Required model to use for translation
    prompt: 'Specify context or spelling', // Optional
    response_format: 'json', // Optional
    temperature: 0.0, // Optional
  });
  // Log the transcribed text
  console.log(translation.text);
  res.json({
    success: true,
    message: translation.text,
  });
});

app.get('/image-info', async (req: Request, res: Response) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: "What's in this image?",
          },
          {
            type: 'image_url',
            image_url: {
              url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/LPU-v1-die.jpg',
            },
          },
        ],
      },
    ],
    model: 'llama-3.2-11b-vision-preview',
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });

  console.log(chatCompletion.choices[0].message.content);
  res.json({
    success: true,
    message: chatCompletion.choices[0].message.content,
  });
});

app.use('/v1/api/users', userRoutes);
app.use('/v1/api/bots', conversationRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  const error = new CustomError('Requested URL Not Found', 404);
  next(error);
});

//Global Error Handler
app.use(
  (
    error: ErrorWithStatus,
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    let errorMessage = error.message || 'Internal Server Error!';

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      errorMessage = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
    }

    console.error('🛑 Error: ' + errorMessage);
    if (res.headersSent) {
      return next(error);
    }

    res.status(error.status || 500).json({
      success: false,
      message: errorMessage,
    });
  },
);

app.all('*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Page Not Found' });
});

export default app;
