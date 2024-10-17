import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportBatchUseCase } from "./make-send-report-batch-use-case.ts";
import { OnAssessmentBatchRemovedGrade } from "@/domain/report/app/subscribers/on-assessment-batch-removed-grade.ts";

export function makeOnAssessmentBatchRemovedGrade() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportBatch = makeSendReportBatchUseCase()
  return new OnAssessmentBatchRemovedGrade(
    reportersRepository,
    coursesRepository,
    sendReportBatch
  )
}