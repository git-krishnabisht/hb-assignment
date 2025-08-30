import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { verifyToken } from "../utils/jwt.js";
import type {
  OTPRequest,
  VerifyOTPRequest,
  SignupOTPRequest,
  VerifySignupOTPRequest,
  GoogleProfileRequest,
} from "../types/auth.ts";

export class AuthController {
  static async signupWithOTP(
    req: Request<{}, {}, SignupOTPRequest>,
    res: Response
  ) {
    try {
      const { name, dob, email } = req.body;

      if (!name || !dob || !email) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Name, date of birth, and email are required",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please provide a valid email address",
        });
      }

      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please provide a valid date of birth",
        });
      }

      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (dobDate > minAge) {
        return res.status(400).json({
          error: "Validation Error",
          message: "You must be at least 13 years old to sign up",
        });
      }

      const result = await AuthService.signupWithOTP(
        name.trim(),
        dob,
        email.toLowerCase().trim()
      );
      res.json(result);
    } catch (error: any) {
      console.error("Signup OTP error:", error);

      if (
        error.message ===
        "User already exists with this email. Please sign in instead."
      ) {
        return res.status(409).json({
          error: "Conflict",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to send signup OTP. Please try again.",
      });
    }
  }

  static async signinWithOTP(req: Request<{}, {}, OTPRequest>, res: Response) {
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

      const result = await AuthService.signinWithOTP(
        email.toLowerCase().trim()
      );
      res.json(result);
    } catch (error: any) {
      console.error("Signin OTP error:", error);

      if (
        error.message ===
        "No account found with this email. Please sign up first."
      ) {
        return res.status(404).json({
          error: "Not Found",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to send signin OTP. Please try again.",
      });
    }
  }

  static async sendOTP(req: Request<{}, {}, OTPRequest>, res: Response) {
    return AuthController.signinWithOTP(req, res);
  }

  static async verifySignupOTP(
    req: Request<{}, {}, VerifySignupOTPRequest>,
    res: Response
  ) {
    try {
      const { name, dob, email, otp } = req.body;

      if (!name || !dob || !email || !otp) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Name, date of birth, email, and OTP are required",
        });
      }

      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        return res.status(400).json({
          error: "Validation Error",
          message: "OTP must be a 6-digit number",
        });
      }

      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please provide a valid date of birth",
        });
      }

      const result = await AuthService.verifySignupOTP(
        name.trim(),
        dob,
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
      console.error("Verify signup OTP error:", error);

      if (
        error.message === "User not found" ||
        error.message === "User already verified. Please sign in instead." ||
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
        message: "Failed to verify signup OTP. Please try again.",
      });
    }
  }

  static async verifySigninOTP(
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

      const result = await AuthService.verifySigninOTP(
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
      console.error("Verify signin OTP error:", error);

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
        message: "Failed to verify signin OTP. Please try again.",
      });
    }
  }

  static async verifyOTP(
    req: Request<{}, {}, VerifyOTPRequest>,
    res: Response
  ) {
    return AuthController.verifySigninOTP(req, res);
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      const user = req.user as any;

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }

      const result = await AuthService.handleGoogleCallback(user);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      if (result.needsProfileCompletion) {
        res.redirect(
          `${frontendUrl}/auth/complete-profile?token=${result.tokens.accessToken}`
        );
      } else {
        res.redirect(
          `${frontendUrl}/auth/success?token=${result.tokens.accessToken}`
        );
      }
    } catch (error) {
      console.error("Google callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  static async completeProfile(
    req: Request<{}, {}, GoogleProfileRequest>,
    res: Response
  ) {
    try {
      const user = req.user as any;
      const { name, dob } = req.body;

      if (!name || !dob) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Name and date of birth are required",
        });
      }

      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Please provide a valid date of birth",
        });
      }

      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 13);
      if (dobDate > minAge) {
        return res.status(400).json({
          error: "Validation Error",
          message: "You must be at least 13 years old",
        });
      }

      const result = await AuthService.completeGoogleProfile(
        user.id,
        name.trim(),
        dob
      );

      res.json(result);
    } catch (error: any) {
      console.error("Complete profile error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to complete profile. Please try again.",
      });
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
          name: user.name,
          dob: user.dob,
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
