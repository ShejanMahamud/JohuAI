import { Request, Response } from 'express';
import { groq } from '../app/app';
import { CodeAssistant } from '../models/code-assistant.model';

export const codeAssistant = async (req: Request, res: Response) => {
  const { user, prompt, conversationId, model } = req.body;
  try {
    let conversation = await CodeAssistant.findById(conversationId);
    if (!conversation) {
      conversation = await CodeAssistant.create({
        user,
        messages: [
          {
            role: 'system',
            content:
              "You're a code bot. You're helping a user with a coding problem.",
          },
        ],
      });
    }
    conversation.messages.push({ role: 'user', content: prompt });
    const completion = await groq.chat.completions.create({
      messages: conversation.messages,
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
