import { OnStudentDeleted } from "@/domain/report/app/subscribers/on-student-deleted.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnStudentDeleted() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnStudentDeleted (
    reportersRepository,
    sendReportUseCase
  )
}