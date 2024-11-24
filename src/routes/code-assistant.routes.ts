import express from 'express';
import { codeAssistant } from '../controllers/code-assistant.controllers';

const router = express.Router();

router.post('/code-assistant', codeAssistant);

export default router;
