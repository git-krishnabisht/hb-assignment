import crypto from "crypto";

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const isOTPValid = (otpExpiry: Date | null): boolean => {
  if (!otpExpiry) return false;
  return new Date() < otpExpiry;
};

export const getOTPExpiry = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
};
