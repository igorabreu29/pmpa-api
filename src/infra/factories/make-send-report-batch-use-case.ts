import { PrismaReportsRepository } from "../database/repositories/prisma-reports-repository.ts";
import { SendReportBatchUseCase } from "@/domain/report/app/use-cases/send-report-batch.ts";

export function makeSendReportBatchUseCase() {
  const reportsRepository = new PrismaReportsRepository()
  return new SendReportBatchUseCase(reportsRepository)
}