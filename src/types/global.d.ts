import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string | object;
    }
  }
}

export interface ErrorWithStatus extends Error {
  status?: number;
}
