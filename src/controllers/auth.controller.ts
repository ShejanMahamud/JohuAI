import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../config';
import { TokenModel } from '../models/token.model';
import { UserModel } from '../models/user.model';
import { sendResponse } from '../utils/responseHandler';

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPassword });
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
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

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
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
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

export const googleLoginSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ensure user data exists in the request
    if (!req.user) {
      return sendResponse(res, {
        status: StatusCodes.UNAUTHORIZED,
        success: false,
        error: 'User not found',
      });
    }

    const { accessToken, refreshToken, email } = req.user as {
      accessToken: string;
      refreshToken: string;
      email: string;
    };

    const user = await UserModel.findOne({ email });

    if (!user) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        error: 'User not found in the database',
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
        { email },
        { refreshToken },
        { new: true }, // Return the updated document (optional)
      );
    }

    // Set the access token as an HTTP-only cookie
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });

    // Respond with the access token and a success message
    return sendResponse(res, {
      success: true,
      message: 'Login successful!',
      status: StatusCodes.OK,
      data: { accessToken },
    });
  } catch (error) {
    return next(error);
  }
};

export const googleLoginFailure = async (
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
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
