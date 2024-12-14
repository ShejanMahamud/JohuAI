import { model, Schema } from 'mongoose';
import { IOtp } from '../types/otp.types';

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    expired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const OtpModel = model<IOtp>('Otp', OtpSchema);
