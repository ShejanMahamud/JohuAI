import { Request, Response } from 'express';
import { groq } from '../app/app';
import { BotConversation } from '../models/bot.model';

export const codeAssistant = async (req: Request, res: Response) => {
  const { user, prompt, conversationId, model } = req.body;
  try {
    let conversation = await BotConversation.findById(conversationId);
    if (!conversation) {
      conversation = await BotConversation.create({
        user,
        botId: 'code-assistant',
        messages: [
          {
            role: 'system',
            content:
              "You're a code bot.Your name is JohuAI. You're helping a user with a coding problem.",
          },
        ],
      });
    }
    conversation.messages.push({ role: 'user', content: prompt });
    const messages = [
      conversation.messages[0],
      conversation.messages[conversation.messages.length - 1],
    ];
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
    });
    const assistantMessage = {
      role: completion.choices[0]?.message?.role,
      content: completion.choices[0].message.content || 'No response provided.',
    };
    conversation.messages.push(assistantMessage);
    conversation.title = conversation.messages[1].content;
    await conversation.save();
    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};

export const contentGenerator = async (req: Request, res: Response) => {
  const { user, prompt, conversationId, model } = req.body;
  try {
    let conversation = await BotConversation.findById(conversationId);
    if (!conversation) {
      conversation = await BotConversation.create({
        botId: 'content-generator',
        user,
        messages: [
          {
            role: 'system',
            content:
              "You're a content bot.You're name is JohuAI. You're helping a user with a content problem, generating content, enhance content and all content related tasks.",
          },
        ],
      });
    }
    conversation.messages.push({ role: 'user', content: prompt });
    const messages = [
      conversation.messages[0],
      conversation.messages[conversation.messages.length - 1],
    ];
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
    });
    const assistantMessage = {
      role: completion.choices[0]?.message?.role,
      content: completion.choices[0].message.content || 'No response provided.',
    };
    conversation.messages.push(assistantMessage);
    conversation.title = conversation.messages[1].content;
    console.log(completion);
    await conversation.save();
    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};
export const textTranslator = async (req: Request, res: Response) => {
  const { user, prompt, conversationId, model } = req.body;
  try {
    let conversation = await BotConversation.findById(conversationId);
    if (!conversation) {
      conversation = await BotConversation.create({
        botId: 'text-translator',
        user,
        messages: [
          {
            role: 'system',
            content:
              "You're a translator bot.You're name is JohuAI. You're helping a user with translating texts, speeches, contents in user preferred language.",
          },
        ],
      });
    }
    conversation.messages.push({ role: 'user', content: prompt });
    const messages = [
      conversation.messages[0],
      conversation.messages[conversation.messages.length - 1],
    ];
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
    });
    const assistantMessage = {
      role: completion.choices[0]?.message?.role,
      content: completion.choices[0].message.content || 'No response provided.',
    };
    conversation.messages.push(assistantMessage);
    conversation.title = conversation.messages[1].content;
    console.log(completion);
    await conversation.save();
    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};

export const textSummarizer = async (req: Request, res: Response) => {
  const { user, prompt, conversationId, model } = req.body;
  try {
    let conversation = await BotConversation.findById(conversationId);
    if (!conversation) {
      conversation = await BotConversation.create({
        botId: 'text-summarizer',
        user,
        messages: [
          {
            role: 'system',
            content:
              "You're a summarizer bot.You're name is JohuAI. You're helping a user with a summarization problem, summarizing text, articles, and all text related tasks.",
          },
        ],
      });
    }
    conversation.messages.push({ role: 'user', content: prompt });
    const messages = [
      conversation.messages[0],
      conversation.messages[conversation.messages.length - 1],
    ];
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
    });
    const assistantMessage = {
      role: completion.choices[0]?.message?.role,
      content: completion.choices[0].message.content || 'No response provided.',
    };
    conversation.messages.push(assistantMessage);
    conversation.title = conversation.messages[1].content;
    console.log(completion);
    await conversation.save();
    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      error,
    });
  }
};