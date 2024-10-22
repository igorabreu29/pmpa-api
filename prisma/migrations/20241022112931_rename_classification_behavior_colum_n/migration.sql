/*
  Warnings:

  - You are about to drop the column `average` on the `ClassificationBehavior` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ClassificationBehavior` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClassificationBehavior" DROP COLUMN "average",
DROP COLUMN "status",
ADD COLUMN     "behavior_average" DECIMAL(65,30),
ADD COLUMN     "behavior_status" TEXT;
