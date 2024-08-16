import { OnStudentCreated } from "@/domain/report/app/subscribers/on-student-created.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnStudentCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnStudentCreated (
    reportersRepository,
    coursesRepository,
    sendReportUseCase
  )
}