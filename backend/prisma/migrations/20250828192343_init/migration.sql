-- CreateTable
CREATE TABLE "public"."users2" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "dob" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users2_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users2_email_key" ON "public"."users2"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users2_googleId_key" ON "public"."users2"("googleId");
