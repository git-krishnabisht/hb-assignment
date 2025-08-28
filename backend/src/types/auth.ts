export interface User {
  id: string;
  email: string;
  password?: string | null;
  googleId?: string | null;
  isEmailVerified: boolean;
  otpCode?: string | null;
  otpExpiry?: Date | null;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface OTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}
