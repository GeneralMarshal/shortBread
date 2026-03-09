/*
  Warnings:

  - You are about to drop the column `shortUrlID` on the `WebhookSuscription` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `WebhookSuscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WebhookSuscription" DROP CONSTRAINT "WebhookSuscription_shortUrlID_fkey";

-- AlterTable
ALTER TABLE "WebhookSuscription" DROP COLUMN "shortUrlID",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "secret" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WebhookSuscription" ADD CONSTRAINT "WebhookSuscription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
