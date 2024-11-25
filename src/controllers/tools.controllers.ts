import axios from 'axios';
import { Request, Response } from 'express';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { groq } from '../app/app';
import config from '../config';
import { Tools } from '../models/tools.model';

export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No file uploaded',
      });
    }
    const tempFilePath = path.join(
      __dirname,
      `temp-${Date.now()}-${req.file.originalname}`,
    );
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3-turbo',
      prompt: prompt,
      temperature: 0.2,
    });

    fs.unlinkSync(tempFilePath);

    const tool = await Tools.create({
      toolId: 'transcribe-audio',
      user: req.user,
      message: {
        text: transcription.text,
      },
    });

    await tool.save();

    res.json({
      success: true,
      message: 'Transcription successful',
      data: transcription.text,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};

export const translateAudio = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No file uploaded',
      });
    }
    const tempFilePath = path.join(
      __dirname,
      `temp-${Date.now()}-${req.file.originalname}`,
    );
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const transcription = await groq.audio.translations.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3-turbo',
      prompt: prompt,
      temperature: 0.2,
    });

    fs.unlinkSync(tempFilePath);

    const tool = await Tools.create({
      toolId: 'translate-audio',
      user: req.user,
      message: {
        text: transcription.text,
      },
    });

    await tool.save();

    res.json({
      success: true,
      message: 'Transcription successful',
      data: transcription.text,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};

export const removeBackground = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No file uploaded',
      });
    }
    const imagePath = req.file.path;
    const imageFile = fs.createReadStream(imagePath);

    const formData = new FormData();
    formData.append('image_file', imageFile);
    const { data } = await axios.post(
      `https://clipdrop-api.co/remove-background/v1`,
      formData,
      {
        headers: {
          'x-api-key': config.clipDropKey,
        },
        responseType: 'arraybuffer',
      },
    );
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;
    const tool = await Tools.create({
      toolId: 'sketch-to-image',
      user: req.user,
      message: {
        image: resultImage,
      },
    });
    await tool.save();
    res.json({
      success: true,
      message: 'Background removed',
      data: resultImage,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};

export const sketchToImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No file uploaded',
      });
    }
    const prompt = req.body.prompt;
    const imagePath = req.file.path;
    const imageFile = fs.createReadStream(imagePath);

    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('prompt', prompt);
    const { data } = await axios.post(
      `https://clipdrop-api.co/sketch-to-image/v1/sketch-to-image`,
      formData,
      {
        headers: {
          'x-api-key': config.clipDropKey,
        },
        responseType: 'arraybuffer',
      },
    );
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;
    const tool = await Tools.create({
      toolId: 'bg-removal',
      user: req.user,
      message: {
        image: resultImage,
      },
      prompt,
    });
    await tool.save();
    res.json({
      success: true,
      message: 'Image generated!',
      data: resultImage,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};

export const textToImage = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    const formData = new FormData();
    formData.append('prompt', prompt);
    const { data } = await axios.post(
      `https://clipdrop-api.co/text-to-image/v1`,
      formData,
      {
        headers: {
          'x-api-key': config.clipDropKey,
        },
        responseType: 'arraybuffer',
      },
    );
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:image/png;base64,${base64Image}`;
    const tool = await Tools.create({
      toolId: 'text-to-image',
      user: req.user,
      message: {
        image: resultImage,
      },
      prompt,
    });
    await tool.save();
    res.json({
      success: true,
      message: 'Image generated!',
      data: resultImage,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};
