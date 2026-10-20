-- AlterTable
ALTER TABLE "Creator" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Creator" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "Creator" ADD COLUMN "verificationExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_verificationToken_key" ON "Creator"("verificationToken");
