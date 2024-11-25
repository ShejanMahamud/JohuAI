import multer from 'multer';

const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const audioUpload = multer({
  storage: multer.memoryStorage(),
});

export { audioUpload, upload };
