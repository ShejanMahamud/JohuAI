export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'pro';
  phone: string;
  profile_picture: string;
  tokenUsed: number;
  status: 'active' | 'inactive';
  wordUsed: number;
  refreshToken: string;
  email_verified: boolean;
  login_method: 'email' | 'google' | 'github';
}
