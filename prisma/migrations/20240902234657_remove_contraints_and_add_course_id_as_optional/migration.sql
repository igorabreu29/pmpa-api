-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_courseId_fkey";

-- DropIndex
DROP INDEX "Report_reporterId_courseId_key";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
