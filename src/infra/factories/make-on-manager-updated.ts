import { OnManagerUpdated } from "@/domain/report/app/subscribers/on-manager-updated.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnManagerUpdated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnManagerUpdated (
    reportersRepository,
    sendReportUseCase
  )
}