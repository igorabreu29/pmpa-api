/*
  Warnings:

  - You are about to drop the column `civilId` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `civilId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "civilId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "civilId" TEXT NOT NULL;
