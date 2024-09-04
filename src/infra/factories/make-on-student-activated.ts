import { OnStudentActivated } from "@/domain/report/app/subscribers/on-student-activated.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnStudentActivated() {
  const reportersRepository = new PrismaReportersRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReport = makeSendReportUseCase()

  return new OnStudentActivated(
    reportersRepository,
    studentsRepository,
    coursesRepository,
    sendReport
  )
}