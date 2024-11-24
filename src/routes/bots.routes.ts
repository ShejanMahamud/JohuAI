import express from 'express';
import { codeAssistant } from '../controllers/code-assistant.controllers';
import { contentGenerator } from '../controllers/content-generator.controllers';

const router = express.Router();

router.post('/code-assistant', codeAssistant);
router.post('/content-generator', contentGenerator);

export default router;
