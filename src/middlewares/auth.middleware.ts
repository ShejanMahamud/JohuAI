import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { UserModel } from '../models/user.model';
import { sendResponse } from '../utils/responseHandler';

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return sendResponse(res, {
      status: StatusCodes.UNAUTHORIZED,
      success: false,
      message: 'Token not found.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return sendResponse(res, {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: 'Refresh token not found.',
        });
      }
      const user = await UserModel.findOne({ refreshToken });
      if (!user) {
        return sendResponse(res, {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: 'User not found.',
        });
      }
      try {
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          config.jwtRefresh,
        ) as JwtPayload;
        if (
          !user ||
          !decodedRefreshToken ||
          user._id.toString() !== decodedRefreshToken.id
        ) {
          return sendResponse(res, {
            status: StatusCodes.UNAUTHORIZED,
            success: false,
            message: 'Invalid or expired refresh token.',
          });
        }
        const newAccessToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          config.jwtSecret,
          { expiresIn: '24h' },
        );
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        req.user = { id: user._id, email: user.email, role: user.role };
        return next();
      } catch (error) {
        return next(error);
      }
    } else {
      next(error);
    }
  }
};
export default authenticateToken;
