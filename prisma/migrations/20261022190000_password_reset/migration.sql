-- AlterTable: Creator ganha token de reset de senha (uso unico, expira em 1h)
ALTER TABLE "Creator" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Creator" ADD COLUMN "resetExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_resetToken_key" ON "Creator"("resetToken");
