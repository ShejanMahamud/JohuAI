import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?:
        | JwtPayload
        | string
        | {
            accessToken: string;
            refreshToken: string;
            email: string;
          };
    }
  }
}

export interface ErrorWithStatus extends Error {
  status?: number;
}
