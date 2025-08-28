import { Router } from "express";
import passport from "../config/passport";
import { AuthController } from "../controllers/authController";
import { authenticateJWT } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: "Too Many Requests",
    message: "Too many OTP requests. Please try again later.",
  },
});

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

router.post("/refresh", AuthController.refreshToken);
router.post("/logout", authenticateJWT, AuthController.logout);

router.get("/me", authenticateJWT, AuthController.getMe);

export default router;
