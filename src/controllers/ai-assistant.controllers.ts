import { CoreTool, generateText } from 'ai';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { google, toolhouse } from '../helpers/constants';
import { AiAssistantModel } from '../models/ai-assistant.model';
import { IAiAssistantMessage } from '../types/ai-assistant.types';
import { sendResponse } from '../utils/responseHandler';

export const aiAssistant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user, prompt, conversationId, model, tone, language, botId } =
    req.body;

  const toneTemperatures: Record<string, number> = {
    professional: 0.2,
    friendly: 0.5,
    casual: 0.6,
    neutral: 0.3,
    humorous: 0.7,
    sarcastic: 0.8,
    happy: 0.7,
    sad: 0.6,
    calm: 0.2,
    energetic: 0.7,
  };

  const systemMessageContent =
    botId === 'ai-assistant'
      ? `You're an AI assistant. Your name is JohuAI. You were made by the Johu AI team. You're helping a user with a problem.${language ? ` Your language is ${language}.` : ''}`
      : botId === 'code-assistant'
        ? `You're an AI-Code assistant. Your name is Codey. You were made by the Johu AI team. You're helping a user with coding problems, debugging, and suggesting better approaches.${language ? ` Your language is ${language}.` : ''}`
        : '';

  try {
    let conversation = await AiAssistantModel.findById(conversationId);

    if (!conversation) {
      conversation = await AiAssistantModel.create({
        user,
        botId,
        messages: [
          {
            role: 'system',
            content: systemMessageContent,
          },
        ],
        meta: { tone, model, language },
      });
    } else {
      conversation.meta = { tone, model, language };
      conversation.botId = botId;

      conversation.messages[0] = {
        role: 'system',
        content: systemMessageContent,
      };
    }
    const tools = (await toolhouse.getTools('johu-ai')) as Record<
      string,
      CoreTool<any, any>
    >;
    conversation.messages.push({ role: 'user', content: prompt });

    const userMessage = conversation.messages.find(
      (msg) => msg.role === 'user',
    );
    const title =
      typeof userMessage?.content === 'string'
        ? userMessage.content.slice(0, 50)
        : 'Untitled Conversation';

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),

      messages: conversation.messages.slice(-2),
      temperature: toneTemperatures[tone],
      topP: 1,
      tools,
      system: systemMessageContent,
    });

    const assistantMessage: IAiAssistantMessage = {
      role: 'assistant',
      content: text || 'No response provided.',
    };
    conversation.messages.push(assistantMessage);
    conversation.title = title;
    await conversation.save();

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const aiAssistantConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, title } = req.query;
    if (!userId) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'User Id is required',
      });
    }

    const conversation = await AiAssistantModel.find({
      botId: 'ai-assistant',
      user: userId,
      title: { $regex: title, $options: 'i' },
    }).sort({ updatedAt: -1 });
    if (!conversation || conversation.length === 0) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'No conversation found',
      });
    }
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'Conversation found',
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const aiAssistantConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId, userId } = req.query;
    if (!conversationId) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Conversation Id is required',
      });
    }
    const conversation = await AiAssistantModel.findOne({
      botId: 'ai-assistant',
      user: userId,
      _id: conversationId,
    });
    if (!conversation) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'No conversation found',
      });
    }
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'Conversation found',
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const aiAssistantConversationDelete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Conversation Id is required',
      });
    }
    const conversation =
      await AiAssistantModel.findByIdAndDelete(conversationId);
    if (!conversation) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'No conversation found',
      });
    }
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const aiAssistantConversationUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId } = req.query;
    if (!conversationId) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Conversation Id is required',
      });
    }
    const conversation = await AiAssistantModel.findByIdAndUpdate(
      conversationId,
      req.body,
      { new: true },
    );
    if (!conversation) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'No conversation found',
      });
    }
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'Conversation updated successfully',
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};
