-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "user_course_on_poles" DROP CONSTRAINT "user_course_on_poles_poleId_fkey";

-- AlterTable
ALTER TABLE "behaviors" ADD COLUMN     "module" INTEGER;

-- AddForeignKey
ALTER TABLE "user_course_on_poles" ADD CONSTRAINT "user_course_on_poles_poleId_fkey" FOREIGN KEY ("poleId") REFERENCES "poles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
