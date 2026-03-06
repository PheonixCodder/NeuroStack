/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "polarCustomerId" TEXT,
ADD COLUMN     "polarProductId" TEXT,
ADD COLUMN     "polarSubscriptionId" TEXT;
