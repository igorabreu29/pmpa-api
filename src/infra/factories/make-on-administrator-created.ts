import { OnAdministratorCreated } from "@/domain/report/app/subscribers/on-administrator-created.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnAdministratorCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnAdministratorCreated (
    reportersRepository,
    sendReportUseCase
  )
}