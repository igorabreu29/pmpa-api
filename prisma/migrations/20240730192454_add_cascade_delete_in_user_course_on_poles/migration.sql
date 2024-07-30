-- DropForeignKey
ALTER TABLE "UserCourseOnPole" DROP CONSTRAINT "UserCourseOnPole_userOnCourseId_fkey";

-- AddForeignKey
ALTER TABLE "UserCourseOnPole" ADD CONSTRAINT "UserCourseOnPole_userOnCourseId_fkey" FOREIGN KEY ("userOnCourseId") REFERENCES "UserOnCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
