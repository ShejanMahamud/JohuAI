import express from 'express';
import {
  codeAssistant,
  contentGenerator,
  textSummarizer,
  textTranslator,
} from '../controllers/bot.controllers';

const router = express.Router();

router.post('/code-assistant', codeAssistant);
router.post('/content-generator', contentGenerator);
router.post('/text-translator', textTranslator);
router.post('/text-summarizer', textSummarizer);

export default router;
