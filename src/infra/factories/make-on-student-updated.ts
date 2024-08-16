import { OnStudentUpdated } from "@/domain/report/app/subscribers/on-student-updated.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnStudentUpdated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnStudentUpdated (
    reportersRepository,
    sendReportUseCase
  )
}