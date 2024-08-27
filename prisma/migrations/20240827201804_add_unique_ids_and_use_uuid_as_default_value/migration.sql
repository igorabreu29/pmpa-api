/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `UserOnCourse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,disciplineId]` on the table `courses_on_disciplines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[courseId,poleId]` on the table `courses_on_poles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserOnCourse_userId_courseId_idx";

-- DropIndex
DROP INDEX "courses_on_poles_courseId_poleId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "UserOnCourse_userId_courseId_key" ON "UserOnCourse"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_on_disciplines_courseId_disciplineId_key" ON "courses_on_disciplines"("courseId", "disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_on_poles_courseId_poleId_key" ON "courses_on_poles"("courseId", "poleId");
