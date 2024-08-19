import { OnStudentBatchCreated } from "@/domain/report/app/subscribers/on-student-batch-created.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportBatchUseCase } from "./make-send-report-batch-use-case.ts";
import { OnAssessmentBatchCreated } from "@/domain/report/app/subscribers/on-assessment-batch-created.ts";

export function makeOnAssessmentBatchCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportBatch = makeSendReportBatchUseCase()
  return new OnAssessmentBatchCreated(
    reportersRepository,
    coursesRepository,
    sendReportBatch
  )
}