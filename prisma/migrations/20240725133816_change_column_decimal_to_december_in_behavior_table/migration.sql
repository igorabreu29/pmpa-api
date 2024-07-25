/*
  Warnings:

  - You are about to drop the column `decimal` on the `behaviors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "behaviors" DROP COLUMN "decimal",
ADD COLUMN     "december" DECIMAL(65,30);
