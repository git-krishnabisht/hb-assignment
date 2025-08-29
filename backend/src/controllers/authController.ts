import type { Request, Response } from "express";
import { AuthService } from "../services/authService.ts";
import { verifyToken } from "../utils/jwt.ts";
import type { OTPRequest, VerifyOTPRequest } from "../types/auth.ts";

export class AuthController {
  static async sendOTP(req: Request<{}, {}, OTPRequest>, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Email is required",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please provide a valid email address",
        });
      }

      const result = await AuthService.sendOTP(email.toLowerCase().trim());
      res.json(result);
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to send OTP. Please try again.",
      });
    }
  }

  static async verifyOTP(
    req: Request<{}, {}, VerifyOTPRequest>,
    res: Response
  ) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Email and OTP are required",
        });
      }

      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "OTP must be a 6-digit number",
        });
      }

      const result = await AuthService.verifyOTP(
        email.toLowerCase().trim(),
        otp
      );

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        message: result.message,
        user: result.user,
        accessToken: result.tokens.accessToken,
      });
    } catch (error: any) {
      console.error("Verify OTP error:", error);

      if (
        error.message === "User not found" ||
        error.message === "No OTP found. Please request a new one." ||
        error.message === "OTP has expired" ||
        error.message === "Invalid OTP"
      ) {
        return res.status(400).json({
          error: "Authentication Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify OTP. Please try again.",
      });
    }
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }

      const { tokens } = await AuthService.handleGoogleCallback(user);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth/success?token=${tokens.accessToken}`);
    } catch (error) {
      console.error("Google callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          error: "Authentication Error",
          message: "Refresh token is required",
        });
      }

      try {
        verifyToken(refreshToken, true);
      } catch (error) {
        return res.status(401).json({
          error: "Authentication Error",
          message: "Invalid or expired refresh token",
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ accessToken: result.tokens.accessToken });
    } catch (error: any) {
      console.error("Refresh token error:", error);

      if (error.message === "Invalid refresh token") {
        return res.status(401).json({
          error: "Authentication Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to refresh token",
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const user = req.user as any;

      await AuthService.logout(user.id);

      res.clearCookie("refreshToken");

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to logout",
      });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      const user = req.user as any;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          hasGoogleAuth: !!user.googleId,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Get me error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to get user information",
      });
    }
  }
}
