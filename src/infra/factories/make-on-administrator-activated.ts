import { OnAdministratorActivated } from "@/domain/report/app/subscribers/on-administrator-activated.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnAdministratorActivated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()

  return new OnAdministratorActivated(
    reportersRepository,
    sendReportUseCase
  )
}