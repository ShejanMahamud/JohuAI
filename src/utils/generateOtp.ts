import { OtpModel } from '../models/otp.model';

export const generateUniqueOtp = async (): Promise<string> => {
  let otpCode: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let isExistOtp: any;
  do {
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    isExistOtp = await OtpModel.findOne({ otp: otpCode });
  } while (isExistOtp);
  return otpCode;
};
