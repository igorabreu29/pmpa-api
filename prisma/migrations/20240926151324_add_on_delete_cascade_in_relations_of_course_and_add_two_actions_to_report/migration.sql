-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Action" ADD VALUE 'LOGIN_CONFIRMED';
ALTER TYPE "Action" ADD VALUE 'STATUS';

-- DropForeignKey
ALTER TABLE "CourseHistoric" DROP CONSTRAINT "CourseHistoric_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_courseId_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_courseId_fkey";

-- DropForeignKey
ALTER TABLE "behaviors" DROP CONSTRAINT "behaviors_courseId_fkey";

-- DropForeignKey
ALTER TABLE "courses_on_disciplines" DROP CONSTRAINT "courses_on_disciplines_courseId_fkey";

-- DropForeignKey
ALTER TABLE "courses_on_poles" DROP CONSTRAINT "courses_on_poles_courseId_fkey";

-- AddForeignKey
ALTER TABLE "CourseHistoric" ADD CONSTRAINT "CourseHistoric_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_on_poles" ADD CONSTRAINT "courses_on_poles_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses_on_disciplines" ADD CONSTRAINT "courses_on_disciplines_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behaviors" ADD CONSTRAINT "behaviors_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
