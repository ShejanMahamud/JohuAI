import { Request, Response } from 'express';
import { groq } from '../app/app';
import { ContentGenerator } from '../models/content-generator.model';

export const contentGenerator = async (req: Request, res: Response) => {
  const { user, prompt, conversationId, model } = req.body;
  try {
    let conversation = await ContentGenerator.findById(conversationId);
    if (!conversation) {
      conversation = await ContentGenerator.create({
        user,
        messages: [
          {
            role: 'system',
            content:
              "You're a content bot. You're helping a user with a content problem, generating content, enhance content and all content related tasks.",
          },
        ],
      });
    }
    conversation.messages.push({ role: 'user', content: prompt });
    const completion = await groq.chat.completions.create({
      messages: conversation.messages.slice(-3),
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
