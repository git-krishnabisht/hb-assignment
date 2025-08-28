import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "../lib/prisma";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }

        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              isEmailVerified: true,
            },
          });
          return done(null, user);
        }

        user = await prisma.user.create({
          data: {
            email,
            googleId: profile.id,
            isEmailVerified: true,
          },
        });

        done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        done(error, false);
      }
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "your-super-secret-key",
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        console.error("JWT strategy error:", error);
        return done(error, false);
      }
    }
  )
);

export default passport;
