import { generateText } from 'ai';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import config from '../config';
import { google, groq } from '../helpers/constants';
import { Tools } from '../models/tools.model';

export const transcribeAudio = async (req: Request, res: Response) => {
  try {
    const { prompt, language, user, temperature, model } = req.body;
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
      model: model,
      prompt: prompt,
      temperature: temperature | 0,
      language,
    });

    fs.unlinkSync(tempFilePath);

    const tool = await Tools.create({
      meta: {
        language,
        temperature,
        prompt,
        model,
      },
      toolId: 'transcribe-audio',
      user,
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
    const { prompt, user } = req.body;
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
      model: 'whisper-large-v3',
      prompt: prompt,
      temperature: 0.2,
    });

    fs.unlinkSync(tempFilePath);

    const tool = await Tools.create({
      toolId: 'translate-audio',
      user,
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
      `${config.toolApiUrl}/remove-background/v1`,
      formData,
      {
        headers: {
          'x-api-key': config.toolApiKey,
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
    const userId = req.body.userId;
    const imagePath = req.file.path;
    const squareImagePath = `${imagePath}-square.jpg`;
    await sharp(imagePath)
      .resize({
        width: 512, // Set desired width and height
        height: 512,
        fit: 'cover', // Ensures the image is cropped if needed
        position: 'center', // Centers the crop
      })
      .toFile(squareImagePath);
    const imageFile = fs.createReadStream(squareImagePath);

    if (!fs.existsSync(imagePath)) {
      return res.json({
        success: false,
        message: 'File does not exist',
      });
    }

    const formData = new FormData();
    formData.append('sketch_file', imageFile);
    formData.append('prompt', prompt);

    const { data } = await axios.post(
      `${config.toolApiUrl}/sketch-to-image/v1/sketch-to-image`,
      formData,
      {
        headers: {
          'x-api-key': config.toolApiKey,
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer',
      },
    );
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;
    const tool = await Tools.create({
      toolId: 'sketch-to-image',
      user: userId,
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

export const objectRemover = async (req: Request, res: Response) => {
  try {
    // Ensure userId is passed in request body
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }
    console.log9;
    // Ensure both image and mask files are uploaded
    const imagePath = req.files?.image_file?.[0]?.path;
    const maskPath = req.files?.mask_file?.[0]?.path;

    if (!imagePath || !maskPath) {
      return res.status(400).json({
        success: false,
        message: 'Image and mask files are required.',
      });
    }

    // Validate files exist on the server
    if (!fs.existsSync(imagePath) || !fs.existsSync(maskPath)) {
      return res.status(404).json({
        success: false,
        message: 'One or more files do not exist.',
      });
    }

    // Prepare image and mask file streams
    const imageFile = fs.createReadStream(imagePath);
    const maskFile = fs.createReadStream(maskPath);

    // Prepare FormData for the external API
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('mask_file', maskFile);

    // Call the external tool API to process the image
    const { data } = await axios.post(
      `${config.toolApiUrl}/cleanup/v1`,
      formData,
      {
        headers: {
          'x-api-key': config.toolApiKey,
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer', // Expecting binary data from the API
      },
    );

    // Convert the binary data to base64 string for embedding in the response
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    const resultImage = `data:image/png;base64,${base64Image}`;

    // Save the result to your database (assuming you're using a model called Tools)
    const tool = await Tools.create({
      toolId: 'object-remover',
      user: userId,
      message: {
        image: resultImage,
      },
    });

    await tool.save();

    // Respond back with the result image in base64 format
    res.status(200).json({
      success: true,
      message: 'Image processed successfully.',
      data: resultImage,
    });
  } catch (error) {
    console.error('Error in object remover:', error);

    // Handle any errors by responding with appropriate status codes
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: (error as Error).message,
    });
  } finally {
    // Clean up uploaded files (if needed)
    if (req.files?.image_file?.[0]?.path)
      fs.unlinkSync(req.files.image_file[0].path);
    if (req.files?.mask_file?.[0]?.path)
      fs.unlinkSync(req.files.mask_file[0].path);
  }
};

export const textToImage = async (req: Request, res: Response) => {
  try {
    const prompt = req.body.prompt;
    const formData = new FormData();
    formData.append('prompt', prompt);
    const { data } = await axios.post(
      `${config.toolApiUrl}/text-to-image/v1`,
      formData,
      {
        headers: {
          'x-api-key': config.toolApiKey,
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

export const aiDetector = async (req: Request, res: Response) => {
  try {
    const { prompt, model, user } = req.body;

    // Input validation
    if (!prompt || !model || !user) {
      return res.status(400).json({
        success: false,
        message: 'Prompt, model, and user are required fields.',
      });
    }

    // AI Detection using groq (assuming `groq` is properly configured)
    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
            You are JohuAI, an advanced AI content detector. Your task is to analyze the provided content and determine the likelihood of it being AI-generated or human-written. 
            Respond with a JSON object containing the following percentages:
            - "likely": The likelihood of being AI-generated.
            - "high likely": The high likelihood of being AI-generated.
            - "human written": The likelihood of being written by a human.
            Your response must only be in valid JSON format with no additional text.
          `,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model,
      temperature: 0.5,
      top_p: 1,
      stop: null,
      stream: false,
      response_format: { type: 'json_object' },
    });

    // Parse the response to ensure it is valid JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(chat.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response.',
        error: (parseError as Error).message,
      });
    }

    // Save the tool usage in the database
    const tool = await Tools.create({
      user,
      toolId: 'ai-detector',
      response: {
        json: parsedResponse,
      },
      meta: {
        model,
        prompt,
      },
    });
    await tool.save();

    // Return the parsed response to the user
    res.status(200).json({
      success: true,
      message: 'AI detected successfully',
      data: parsedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while detecting AI content.',
      error: (error as Error).message,
    });
  }
};

export const articleGenerator = async (req: Request, res: Response) => {
  try {
    const { prompt, tone, language, creativity, model, user } = req.body;

    // Input validation
    if (!prompt || !tone || !language || !creativity || !model || !user) {
      return res.status(400).json({
        success: false,
        message:
          'Prompt, tone, language, creativity, model, and user are required fields.',
      });
    }

    // AI Article Generation using groq (assuming `groq` is properly configured)
    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
            You are JohuAI, a creative article writer. Your task is to write high-quality, engaging articles based on the user-provided prompt.
            - Write the article in the specified language: "${language}".
            - Maintain the specified tone: "${tone}".
            - Use creativity level (temperature): ${creativity}.
            Your response should only contain the article content with no additional formatting or comments.
          `,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model,
      temperature: creativity,
      top_p: 1,
      stop: null,
    });

    // Parse and validate the response content
    const generatedArticle = chat.choices[0]?.message?.content || '';
    if (!generatedArticle) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate an article. Please try again.',
      });
    }

    // Save the tool usage in the database
    const tool = await Tools.create({
      user,
      toolId: 'article-generator',
      response: {
        text: generatedArticle,
      },
      meta: {
        tone,
        language,
        temperature: creativity,
        model,
        prompt,
      },
    });
    await tool.save();

    // Return the generated article to the user
    res.status(200).json({
      success: true,
      message: 'Article generated successfully',
      data: generatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating the article.',
      error: (error as Error).message,
    });
  }
};

export const codeGenerator = async (req: Request, res: Response) => {
  try {
    const { prompt, language, framework, complexity, model, user } = req.body;

    // Input validation
    if (!prompt || !language || !complexity || !model || !user) {
      return res.status(400).json({
        success: false,
        message:
          'Prompt, language, complexity, model, and user are required fields.',
      });
    }
    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
            You are JohuAI, a highly intelligent code generator. Your task is to generate clean, efficient, and well-documented code based on the user's requirements.
            - Language: "${language}".
            - Framework (if applicable): "${framework}".
            - Complexity level: "${complexity}" (e.g., beginner, intermediate, advanced).
            Provide only the code as your response, with necessary comments for understanding.
          `,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model,
      temperature: 0.7,
      top_p: 1,
      stop: null,
    });

    // Extract the generated code from the AI response
    const generatedCode = chat.choices[0]?.message?.content || '';
    if (!generatedCode) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate code. Please try again.',
      });
    }

    // Save the tool usage in the database
    const tool = await Tools.create({
      user,
      toolId: 'code-generator',
      response: {
        text: generatedCode,
      },
      meta: {
        language,
        framework,
        complexity,
        model,
        prompt,
      },
    });
    await tool.save();

    // Return the generated code to the user
    res.status(200).json({
      success: true,
      message: 'Code generated successfully',
      data: generatedCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating code.',
      error: (error as Error).message,
    });
  }
};

export const webSearcher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'summarize this document?',
            },
            {
              type: 'file',
              data: fs.readFileSync(
                path.join(process.cwd(), 'src/app', 'backend-resume.pdf'),
              ),
              mimeType: 'application/pdf',
            },
          ],
        },
      ],
    });
    console.log('Generated Text:', result);

    res.json({
      success: true,
      message: 'Web search successful',
      data: result.text,
    });
  } catch (error) {
    next(error);
  }
};
