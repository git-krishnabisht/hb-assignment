export interface User {
  id: string;
  name?: string | null;
  dob?: Date | null;
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

export interface SignupOTPRequest {
  name: string;
  dob: string; 
  email: string;
}

export interface OTPRequest {
  email: string;
}

export interface VerifySignupOTPRequest {
  name: string;
  dob: string; 
  email: string;
  otp: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface GoogleProfileRequest {
  name?: string;
  dob?: string;
}
