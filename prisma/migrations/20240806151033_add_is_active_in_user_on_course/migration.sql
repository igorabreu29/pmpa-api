/*
  Warnings:

  - Added the required column `isActive` to the `UserOnCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserOnCourse" ADD COLUMN     "isActive" BOOLEAN NOT NULL;
