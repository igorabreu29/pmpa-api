/*
  Warnings:

  - Added the required column `formula` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Formula" AS ENUM ('CGS', 'CFP', 'CAS', 'CHO', 'CFO');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "formula" "Formula" NOT NULL;
