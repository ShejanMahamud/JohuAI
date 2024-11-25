import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  databaseString: process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || '',
  jwtSecret: process.env.ACCESS_TOKEN || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  groqAIkey: process.env.GROQ_API_KEY || '',
  clipDropKey: process.env.CLIPDROP_API_KEY || '',
};
