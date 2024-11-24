import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/user.types';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
    phone: { type: String, required: true },
    tokenUsed: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', userSchema);
