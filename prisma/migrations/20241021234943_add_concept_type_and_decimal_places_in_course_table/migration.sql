-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "conceptType" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "decimalPlaces" INTEGER NOT NULL DEFAULT 3;
