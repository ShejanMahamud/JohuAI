import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import path from 'path';
import config from '../config';
import { OtpModel } from '../models/otp.model';
import { TokenModel } from '../models/token.model';
import { UserModel } from '../models/user.model';
import { generateUniqueOtp } from '../utils/generateOtp';
import { sendResponse } from '../utils/responseHandler';
import { sendEmail } from '../utils/sendEmail';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, profile_picture } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
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

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      profile_picture,
    });
    await user.save();

    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user)
      return sendResponse(res, {
        success: false,
        status: StatusCodes.NOT_FOUND,
        error: 'Invalid credentials',
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return sendResponse(res, {
        success: false,
        status: StatusCodes.UNAUTHORIZED,
        error: 'Invalid credentials',
      });

    const accessToken = jwt.sign(
      { id: user._id, email: email, role: user.role },
      config.jwtSecret,
      {
        expiresIn: '24h',
      },
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: email, role: user.role },
      config.jwtRefresh,
      {
        expiresIn: '7d',
      },
    );
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return sendResponse(res, {
      success: true,
      message: 'Login successful!',
      status: StatusCodes.OK,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const socialLoginSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestedUser = {
      email: req.query.email,
      accessToken: req.query.accessToken,
      refreshToken: req.query.refreshToken,
    };
    if (!requestedUser) {
      return sendResponse(res, {
        status: StatusCodes.UNAUTHORIZED,
        success: false,
        error: 'User not found in request',
      });
    }

    const user = await UserModel.findOne({ email: requestedUser?.email });

    if (!user) {
      return sendResponse(res, {
        status: StatusCodes.UNAUTHORIZED,
        success: false,
        error: 'User not found',
      });
    }

    let shouldUpdateRefreshToken = false;

    // If the user has an existing refresh token
    if (user.refreshToken) {
      try {
        // Verify if the existing refresh token is valid
        jwt.verify(user.refreshToken, config.jwtRefresh);
      } catch {
        // If invalid, mark it for update
        shouldUpdateRefreshToken = true;
      }
    } else {
      // If no refresh token exists, mark it for update
      shouldUpdateRefreshToken = true;
    }

    // Update the refresh token only if necessary
    if (shouldUpdateRefreshToken) {
      await UserModel.findOneAndUpdate(
        { email: requestedUser.email },
        { refreshToken: requestedUser.refreshToken },
        { new: true }, // Return the updated document (optional)
      );
    }

    // Set the access token as an HTTP-only cookie
    res.cookie('accessToken', requestedUser?.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie('refreshToken', requestedUser?.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Respond with the access token and a success message
    // return sendResponse(res, {
    //   success: true,
    //   message: 'Login successful!',
    //   status: StatusCodes.OK,
    //   data: { accessToken },
    // });
    res.redirect(`${config.clientUrl}`);
  } catch (error) {
    return next(error);
  }
};

export const socialLoginFailure = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.redirect(
      `${config.clientUrl}/auth/signin?error=google_login_failed`,
    );
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tokenBlacklist = new TokenModel({ token: req.cookies.accessToken });
    tokenBlacklist.blacklisted = true;
    await tokenBlacklist.save();
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OtpModel.findOne({ email, otp, expired: false });
    if (!otpRecord) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Invalid or expired OTP',
      });
    }
    if (otpRecord.expiresAt < new Date()) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'OTP has expired',
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'User not found',
      });
    }
    if (otpRecord.otp !== otp) {
      return sendResponse(res, {
        status: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Invalid OTP',
      });
    }
    // Update OTP record
    otpRecord.expired = true;
    user.email_verified = true;
    await user.save();
    await otpRecord.save();

    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    return next(error);
  }
};
