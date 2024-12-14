import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (
  email: string,
  emailData: {
    subject: string;
    body: string;
  },
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.gmailUser,
        pass: config.gmailPassword,
      },
    });

    await transporter.sendMail({
      from: `"Johu AI" <${config.gmailUser}>`,
      to: email,
      subject: emailData.subject,
      html: emailData.body,
    });
  } catch (error) {
    console.error('Email sending error:', (error as Error).message);
    throw new Error('Failed to send email');
  }
};
