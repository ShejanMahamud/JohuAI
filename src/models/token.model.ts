import mongoose, { Schema } from 'mongoose';
import { IToken } from '../types/token.types';

const tokenSchema = new Schema<IToken>(
  {
    token: { type: String, required: true },
    blacklisted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const TokenModel = mongoose.model<IToken>('TokenModel', tokenSchema);
