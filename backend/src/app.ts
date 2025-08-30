import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Database from "./config/database";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import passport from "./config/passport";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message;

    res.status(err.status || 500).json({
      error: "Internal Server Error",
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 3000;

process.on("SIGINT", async () => {
  console.log("\n Shutting down gracefully...");
  await Database.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n Shutting down gracefully...");
  await Database.disconnect();
  process.exit(0);
});

const startServer = async () => {
  try {
    await Database.connect();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
