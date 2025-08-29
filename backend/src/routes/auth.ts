import { Router } from "express";
import passport from "../config/passport.ts";
import { AuthController } from "../controllers/authController.ts";
import { authenticateJWT } from "../middleware/auth.ts";
import rateLimit from "express-rate-limit";

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too Many Requests",
    message: "Too many OTP requests. Please try again later.",
  },
});

router.post("/signup/send-otp", otpLimiter, AuthController.signupWithOTP);

router.post("/signup/verify-otp", AuthController.verifySignupOTP);

router.post("/signin/send-otp", otpLimiter, AuthController.signinWithOTP);

router.post("/signin/verify-otp", AuthController.verifySigninOTP);

router.post("/send-otp", otpLimiter, AuthController.sendOTP);
router.post("/verify-otp", AuthController.verifyOTP);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleCallback
);

router.post(
  "/complete-profile",
  authenticateJWT,
  AuthController.completeProfile
);

router.post("/refresh", AuthController.refreshToken);
router.post("/logout", authenticateJWT, AuthController.logout);
router.get("/me", authenticateJWT, AuthController.getMe);

export default router;
