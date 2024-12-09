import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../models/user.model';
import { sendResponse } from '../utils/responseHandler';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get all users from the database
    const users = await UserModel.find().sort({ createdAt: -1 });
    if (!users) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'Users not found',
      });
    }
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
export const getAUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get a user from the database
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return sendResponse(res, {
        status: StatusCodes.NOT_FOUND,
        success: false,
        message: 'User not found',
      });
    }
    return sendResponse(res, {
      status: StatusCodes.OK,
      success: true,
      message: 'Users fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
