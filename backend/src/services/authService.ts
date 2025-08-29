import { prisma } from "../lib/prisma.ts";
import { generateOTP, getOTPExpiry, isOTPValid } from "../utils/otp.ts";
import { generateTokens } from "../utils/jwt.ts";
import { sendSignupOTPEmail, sendSigninOTPEmail } from "../utils/email.ts";
import type { User } from "../types/auth.ts";

export class AuthService {
  static async signupWithOTP(
    name: string,
    dob: string,
    email: string
  ): Promise<{ message: string }> {
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    const dobDate = new Date(dob);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isEmailVerified) {
      throw new Error(
        "User already exists with this email. Please sign in instead."
      );
    }

    if (existingUser && !existingUser.isEmailVerified) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          dob: dobDate,
          otpCode: otp,
          otpExpiry,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          dob: dobDate,
          email,
          otpCode: otp,
          otpExpiry,
          isEmailVerified: false,
        },
      });
    }

    await sendSignupOTPEmail(email, otp);

    return { message: "OTP sent successfully for signup" };
  }

  static async signinWithOTP(email: string): Promise<{ message: string }> {
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new Error(
        "No account found with this email. Please sign up first."
      );
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        otpCode: otp,
        otpExpiry,
      },
    });

    await sendSigninOTPEmail(email, otp);

    return { message: "OTP sent successfully for signin" };
  }

  static async sendOTP(email: string): Promise<{ message: string }> {
    return this.signinWithOTP(email);
  }

  static async verifySignupOTP(
    name: string,
    dob: string,
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

    if (user.isEmailVerified) {
      throw new Error("User already verified. Please sign in instead.");
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
    const dobDate = new Date(dob);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        dob: dobDate,
        isEmailVerified: true,
        otpCode: null,
        otpExpiry: null,
        refreshToken: tokens.refreshToken,
      },
    });

    return {
      message: "Signup successful",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        dob: updatedUser.dob,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
      },
      tokens,
    };
  }

  static async verifySigninOTP(
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
      message: "Signin successful",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        dob: updatedUser.dob,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
      },
      tokens,
    };
  }

  static async verifyOTP(
    email: string,
    otp: string
  ): Promise<{
    message: string;
    user: Partial<User>;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    return this.verifySigninOTP(email, otp);
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
    user: User,
    profileData?: { name?: string; dob?: string }
  ): Promise<{
    tokens: { accessToken: string; refreshToken: string };
    needsProfileCompletion: boolean;
  }> {
    const tokens = generateTokens(user.id);

    let updateData: any = { refreshToken: tokens.refreshToken };

    if (profileData) {
      if (profileData.name) updateData.name = profileData.name;
      if (profileData.dob) updateData.dob = new Date(profileData.dob);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    const needsProfileCompletion = !updatedUser?.name || !updatedUser?.dob;

    return {
      tokens,
      needsProfileCompletion,
    };
  }

  static async completeGoogleProfile(
    userId: string,
    name: string,
    dob: string
  ): Promise<{ message: string; user: Partial<User> }> {
    const dobDate = new Date(dob);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        dob: dobDate,
      },
    });

    return {
      message: "Profile completed successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        dob: updatedUser.dob,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
      },
    };
  }
}
