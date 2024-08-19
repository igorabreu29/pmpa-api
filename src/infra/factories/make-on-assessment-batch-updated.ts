import { OnAssessmentBatchUpdated } from "@/domain/report/app/subscribers/on-assessment-batch-updated.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportBatchUseCase } from "./make-send-report-batch-use-case.ts";

export function makeOnAssessmentBatchUpdated() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportBatch = makeSendReportBatchUseCase()
  return new OnAssessmentBatchUpdated(
    reportersRepository,
    coursesRepository,
    sendReportBatch
  )
}