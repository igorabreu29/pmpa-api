import { OnBehaviorCreated } from "@/domain/report/app/subscribers/on-behavior-created.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";

export function makeOnBehaviorCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnBehaviorCreated(
    reportersRepository,
    sendReportUseCase
  )
}