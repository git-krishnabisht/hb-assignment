import { prisma } from "../lib/prisma";
import { generateOTP, getOTPExpiry, isOTPValid } from "../utils/otp";
import { generateTokens } from "../utils/jwt";
import { sendOTPEmail } from "../utils/email";
import { hashPassword, comparePassword } from "../utils/password";
import type { User } from "../types/auth";

export class AuthService {
  static async sendOTP(email: string): Promise<{ message: string }> {
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          otpCode: otp,
          otpExpiry,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email,
          otpCode: otp,
          otpExpiry,
          isEmailVerified: false,
        },
      });
    }

    await sendOTPEmail(email, otp);

    return { message: "OTP sent successfully" };
  }

  static async verifyOTP(
    email: string,
    otp: string
  ): Promise<{
    message: string;
    user: Partial<User>;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.otpCode || !user.otpExpiry) {
      throw new Error("No OTP found. Please request a new one.");
    }

    if (!isOTPValid(user.otpExpiry)) {
      throw new Error("OTP has expired");
    }

    if (user.otpCode !== otp) {
      throw new Error("Invalid OTP");
    }

    const tokens = generateTokens(user.id);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otpCode: null,
        otpExpiry: null,
        refreshToken: tokens.refreshToken,
      },
    });

    return {
      message: "Authentication successful",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
      },
      tokens,
    };
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const tokens = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { tokens };
  }

  static async logout(userId: string): Promise<{ message: string }> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: "Logged out successfully" };
  }

  static async handleGoogleCallback(
    user: User
  ): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
    const tokens = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { tokens };
  }
}
