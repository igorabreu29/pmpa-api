/*
  Warnings:

  - You are about to drop the `CourseHistoric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCourseOnPole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOnCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses_on_disciplines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseHistoric" DROP CONSTRAINT "CourseHistoric_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "UserCourseOnPole" DROP CONSTRAINT "UserCourseOnPole_poleId_fkey";

-- DropForeignKey
ALTER TABLE "UserCourseOnPole" DROP CONSTRAINT "UserCourseOnPole_userOnCourseId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnCourse" DROP CONSTRAINT "UserOnCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnCourse" DROP CONSTRAINT "UserOnCourse_userId_fkey";

-- DropForeignKey
ALTER TABLE "courses_on_disciplines" DROP CONSTRAINT "courses_on_disciplines_courseId_fkey";

-- DropForeignKey
ALTER TABLE "courses_on_disciplines" DROP CONSTRAINT "courses_on_disciplines_disciplineId_fkey";

-- DropTable
DROP TABLE "CourseHistoric";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "UserCourseOnPole";

-- DropTable
DROP TABLE "UserOnCourse";

-- DropTable
DROP TABLE "courses_on_disciplines";

-- CreateTable
CREATE TABLE "user_on_courses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_on_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_course_on_poles" (
    "id" TEXT NOT NULL,
    "userOnCourseId" TEXT NOT NULL,
    "poleId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_course_on_poles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_historic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "classname" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "finish_date" TIMESTAMP(3) NOT NULL,
    "speechs" INTEGER,
    "internships" INTEGER,
    "total_hours" INTEGER,
    "division_boss" TEXT,
    "commander" TEXT,

    CONSTRAINT "course_historic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_on_disciplines" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "module" INTEGER NOT NULL,
    "hours" INTEGER NOT NULL,
    "expected" TEXT NOT NULL,

    CONSTRAINT "course_on_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filename" TEXT,
    "filelink" TEXT,
    "ip" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "Action" NOT NULL DEFAULT 'ADD',

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_on_courses_userId_courseId_key" ON "user_on_courses"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_on_disciplines_courseId_disciplineId_key" ON "course_on_disciplines"("courseId", "disciplineId");

-- AddForeignKey
ALTER TABLE "user_on_courses" ADD CONSTRAINT "user_on_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_on_courses" ADD CONSTRAINT "user_on_courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_on_poles" ADD CONSTRAINT "user_course_on_poles_userOnCourseId_fkey" FOREIGN KEY ("userOnCourseId") REFERENCES "user_on_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course_on_poles" ADD CONSTRAINT "user_course_on_poles_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES "poles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_historic" ADD CONSTRAINT "course_historic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_on_disciplines" ADD CONSTRAINT "course_on_disciplines_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_on_disciplines" ADD CONSTRAINT "course_on_disciplines_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
