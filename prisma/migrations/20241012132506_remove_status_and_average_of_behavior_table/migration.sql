/*
  Warnings:

  - You are about to drop the column `average` on the `behaviors` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `behaviors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "behaviors" DROP COLUMN "average",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "BehaviorStatus";
