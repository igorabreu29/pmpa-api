import { OnAssessmentDeleted } from "@/domain/report/app/subscribers/on-assessment-deleted.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";

export function makeOnAssessmentDeleted() {
  const studentsRepository = new PrismaStudentsRepository()
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnAssessmentDeleted(
    studentsRepository,
    reportersRepository,
    coursesRepository,
    disciplinesRepository,
    sendReportUseCase
  )
}