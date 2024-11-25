import express from 'express';
import {
  removeBackground,
  sketchToImage,
  textToImage,
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
export default router;
