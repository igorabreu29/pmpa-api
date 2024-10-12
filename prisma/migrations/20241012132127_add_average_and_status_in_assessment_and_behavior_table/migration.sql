/*
  Warnings:

  - Added the required column `average` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_recovering` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `average` to the `behaviors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `behaviors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVED', 'DISAPPROVED', 'APPROVED_SECOND_SEASON', 'SECOND_SEASON');

-- CreateEnum
CREATE TYPE "BehaviorStatus" AS ENUM ('APPROVED', 'DISAPPROVED');

-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "average" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "is_recovering" BOOLEAN NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "behaviors" ADD COLUMN     "average" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "status" "BehaviorStatus" NOT NULL;
