// utils/responseHandler.ts
import { Response } from 'express';

interface ResponseOptions {
  success: boolean;
  status: number;
  message?: string;
  data?: unknown;
  error?: string;
  resType?: string;
}

export const sendResponse = (res: Response, options: ResponseOptions) => {
  const { success, status, message, data, error } = options;
  res.status(status).json({
    success,
    message,
    data,
    error,
  });
};
