import { OnAdministratorDisabled } from "@/domain/report/app/subscribers/on-administrator-disabled.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnAdministratorDisabled() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()

  return new OnAdministratorDisabled(
    reportersRepository,
    sendReportUseCase
  )
}