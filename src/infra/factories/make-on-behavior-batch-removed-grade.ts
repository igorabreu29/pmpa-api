import { OnBehaviorBatchRemovedGrade } from "@/domain/report/app/subscribers/on-behavior-batch-removed-grade.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportBatchUseCase } from "./make-send-report-batch-use-case.ts";

export function makeOnBehaviorBatchRemovedGrade() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportBatch = makeSendReportBatchUseCase()
  return new OnBehaviorBatchRemovedGrade(
    reportersRepository,
    coursesRepository,
    sendReportBatch
  )
} 