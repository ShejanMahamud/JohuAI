export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'pro';
  phone: string;
  tokenUsed: number;
  status: 'active' | 'inactive';
  wordUsed: number;
  refreshToken: string;
}
