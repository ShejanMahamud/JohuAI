import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  databaseString: process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || '',
  jwtSecret: process.env.ACCESS_TOKEN || '',
  jwtRefresh: process.env.REFRESH_TOKEN || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  groqAIkey: process.env.GROQ_API_KEY || '',
  toolApiKey: process.env.TOOL_API_KEY || '',
  toolApiUrl: process.env.TOOL_API_URL || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  serverUrl: process.env.SERVER_URL || '',
};
