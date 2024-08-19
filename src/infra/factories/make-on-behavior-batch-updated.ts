import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportBatchUseCase } from "./make-send-report-batch-use-case.ts";
import { OnBehaviorBatchUpdated } from "@/domain/report/app/subscribers/on-behavior-batch-updated.ts";

export function makeOnBehaviorBatchUpdated() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportBatch = makeSendReportBatchUseCase()
  return new OnBehaviorBatchUpdated(
    reportersRepository,
    coursesRepository,
    sendReportBatch
  )
} 