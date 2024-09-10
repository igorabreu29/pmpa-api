-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnCourse" DROP CONSTRAINT "UserOnCourse_userId_fkey";

-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "behaviors" DROP CONSTRAINT "behaviors_studentId_fkey";

-- AddForeignKey
ALTER TABLE "UserOnCourse" ADD CONSTRAINT "UserOnCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behaviors" ADD CONSTRAINT "behaviors_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
