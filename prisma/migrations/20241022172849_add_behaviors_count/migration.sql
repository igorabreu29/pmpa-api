/*
  Warnings:

  - You are about to drop the `ClassificationBehavior` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassificationBehavior" DROP CONSTRAINT "ClassificationBehavior_classificationId_fkey";

-- AlterTable
ALTER TABLE "Classification" ADD COLUMN     "behaviorsCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ClassificationBehavior";
