import { SendReportUseCase } from "@/domain/report/app/use-cases/send-report.ts";
import { PrismaReportsRepository } from "../database/repositories/prisma-reports-repository.ts";

export function makeSendReportUseCase() {
  const reportsRepository = new PrismaReportsRepository()
  return new SendReportUseCase(reportsRepository)
}