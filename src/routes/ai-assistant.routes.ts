import express from 'express';
import {
  aiAssistant,
  aiAssistantConversation,
  aiAssistantConversationById,
  aiAssistantConversationDelete,
  aiAssistantConversationUpdate,
} from '../controllers/ai-assistant.controllers';

const router = express.Router();

router.post('/send-prompt', aiAssistant);
router.get('/conversations', aiAssistantConversation);
router.get('/conversation', aiAssistantConversationById);
router.delete('/conversation', aiAssistantConversationDelete);
router.patch('/conversation', aiAssistantConversationUpdate);

export default router;
