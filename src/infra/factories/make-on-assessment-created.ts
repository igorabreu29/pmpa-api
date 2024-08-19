import { OnAssessmentCreated } from "@/domain/report/app/subscribers/on-assessment-created.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";

export function makeOnAssessmentCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnAssessmentCreated(
    reportersRepository,
    sendReportUseCase
  )
}