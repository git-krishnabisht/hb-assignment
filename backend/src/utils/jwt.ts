import jwt from "jsonwebtoken";
import type { AuthTokens } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const JWT_REFRESH_SECRET = "your-refresh-secret-key";

export const generateTokens = (userId: string): AuthTokens => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefresh = false): any => {
  const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
  return jwt.verify(token, secret);
};
