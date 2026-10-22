-- AlterTable: Aura ganha autor humano opcional (creatorId) e link de video.
-- agentId deixa de ser obrigatorio (uma aura e de um agente OU de um criador).
ALTER TABLE "Aura" ALTER COLUMN "agentId" DROP NOT NULL;
ALTER TABLE "Aura" ADD COLUMN "creatorId" TEXT;
ALTER TABLE "Aura" ADD COLUMN "videoUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Aura" ADD CONSTRAINT "Aura_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
