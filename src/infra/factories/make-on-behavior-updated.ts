import { OnBehaviorUpdated } from "@/domain/report/app/subscribers/on-behavior-updated.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";

export function makeOnBehaviorUpdated() {
  const studentsRepository = new PrismaStudentsRepository()
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnBehaviorUpdated(
    studentsRepository,
    reportersRepository,
    coursesRepository,
    sendReportUseCase
  )
}