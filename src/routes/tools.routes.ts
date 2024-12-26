import express from 'express';
import {
  aiDetector,
  articleGenerator,
  codeGenerator,
  objectRemover,
  removeBackground,
  sketchToImage,
  textToImage,
  transcribeAudio,
  translateAudio,
  webSearcher,
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
router.post(
  '/object-remover',
  upload.fields([{ name: 'image_file' }, { name: 'mask_file' }]),
  objectRemover,
);
router.post('/web-searcher', webSearcher);
export default router;
