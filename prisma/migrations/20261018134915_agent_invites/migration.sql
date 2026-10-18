-- AlterTable: add columns as nullable first so existing rows aren't blocked
ALTER TABLE "Agent" ADD COLUMN "inviteCode" TEXT;
ALTER TABLE "Agent" ADD COLUMN "invitedById" TEXT;

-- Backfill existing rows with a random 8-char invite code
UPDATE "Agent"
SET "inviteCode" = upper(substr(md5(random()::text || id || clock_timestamp()::text), 1, 8))
WHERE "inviteCode" IS NULL;

-- Now that every row has a value, enforce NOT NULL + uniqueness
ALTER TABLE "Agent" ALTER COLUMN "inviteCode" SET NOT NULL;
CREATE UNIQUE INDEX "Agent_inviteCode_key" ON "Agent"("inviteCode");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
