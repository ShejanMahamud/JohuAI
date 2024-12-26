import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  databaseString: process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefresh: process.env.JWT_REFRESH || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  groqAIkey: process.env.GROQ_API_KEY || '',
  toolApiKey: process.env.TOOL_API_KEY || '',
  toolApiUrl: process.env.TOOL_API_URL || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  serverUrl: process.env.SERVER_URL || '',
  gmailUser: process.env.GMAIL_USER || '',
  gmailPassword: process.env.GMAIL_PASS || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  toolhouseApiKey: process.env.TOOL_HOUSE_API_KEY || '',
};
