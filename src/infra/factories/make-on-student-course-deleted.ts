import { OnStudentCourseDeleted } from "@/domain/report/app/subscribers/on-student-course-deleted.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnStudentCourseDeleted() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const reportersRepository = new PrismaReportersRepository()
  const sendReport = makeSendReportUseCase()

  return new OnStudentCourseDeleted(
    coursesRepository,
    studentsRepository,
    reportersRepository,
    sendReport
  )
}