import express from 'express';
import {
  aiDetector,
  articleGenerator,
  codeGenerator,
  removeBackground,
  sketchToImage,
  textToImage,
  textToSpeech,
  transcribeAudio,
  translateAudio,
} from '../controllers/tools.controllers';
import { audioUpload, upload } from '../middlewares/upload.middleware';
const router = express.Router();

router.post('/transcribe-audio', audioUpload.single('audio'), transcribeAudio);
router.post('/translate-audio', audioUpload.single('audio'), translateAudio);
router.post('/remove-bg', upload.single('image'), removeBackground);
router.post('/sketch-to-image', upload.single('image'), sketchToImage);
router.post('/text-to-image', textToImage);
router.post('/ai-detector', aiDetector);
router.post('/article-generator', articleGenerator);
router.post('/code-generator', codeGenerator);
router.post('/text-to-speech', textToSpeech);
export default router;
