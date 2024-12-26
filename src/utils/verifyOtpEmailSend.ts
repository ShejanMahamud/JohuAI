import fs from 'fs';
import path from 'path';
import { OtpModel } from '../models/otp.model';
import { generateUniqueOtp } from './generateOtp';
import { sendEmail } from './sendEmail';
export const verifyOtpEmailSend = async (email: string, name: string) => {
  const otpCode = await generateUniqueOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const otp = new OtpModel({
    email,
    otp: otpCode,
    expiresAt,
  });
  await otp.save();
  const templatePath = path.join(
    __dirname,
    '../templates/email-verification.html',
  );
  let emailTemplate = fs.readFileSync(templatePath, 'utf8');
  emailTemplate = emailTemplate
    .replace('{{name}}', name)
    .replace('{{otp}}', otpCode)
    .replace('{{userEmail}}', email)
    .replace('{{userOtp}}', otpCode);

  const emailData = {
    subject: 'Verify Your Email',
    body: emailTemplate,
  };

  await sendEmail(email, emailData);
};
