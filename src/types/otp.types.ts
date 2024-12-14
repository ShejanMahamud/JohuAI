export interface IOtp {
  email: string;
  otp: string;
  expiresAt: Date;
  expired: boolean;
}
