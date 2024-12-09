import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/user.types';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
    phone: { type: String, required: false },
    tokenUsed: { type: Number, default: 0 },
    wordUsed: { type: Number, default: 0 },
    refreshToken: { type: String, required: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>('UserModel', userSchema);
