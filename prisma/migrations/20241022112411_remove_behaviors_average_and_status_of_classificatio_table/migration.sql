/*
  Warnings:

  - You are about to drop the column `behaviorAverageModule1` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `behaviorAverageModule2` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `behaviorAverageModule3` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `behaviorStatusModule1` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `behaviorStatusModule2` on the `Classification` table. All the data in the column will be lost.
  - You are about to drop the column `behaviorStatusModule3` on the `Classification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Classification" DROP COLUMN "behaviorAverageModule1",
DROP COLUMN "behaviorAverageModule2",
DROP COLUMN "behaviorAverageModule3",
DROP COLUMN "behaviorStatusModule1",
DROP COLUMN "behaviorStatusModule2",
DROP COLUMN "behaviorStatusModule3";
