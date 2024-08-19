import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportBatchUseCase } from "./make-send-report-batch-use-case.ts";
import { OnStudentBatchUpdated } from "@/domain/report/app/subscribers/on-student-batch-updated.ts";

export function makeOnStudentBatchUpdated() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportBatch = makeSendReportBatchUseCase()
  return new OnStudentBatchUpdated(
    reportersRepository,
    coursesRepository,
    sendReportBatch
  )
}