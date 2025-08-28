import type { Request, Response, NextFunction } from "express";
import passport from "passport";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      isEmailVerified: boolean;
      googleId?: string | null;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      console.error("JWT authentication error:", err);
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Please provide a valid token",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
