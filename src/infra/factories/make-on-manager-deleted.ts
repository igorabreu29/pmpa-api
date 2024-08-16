import { OnManagerDeleted } from "@/domain/report/app/subscribers/on-manager-deleted.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnManagerDeleted() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnManagerDeleted (
    reportersRepository,
    sendReportUseCase
  )
}