import { FetchReportsUseCase } from "@/domain/boletim/app/use-cases/fetch-reports.ts";
import { PrismaReportsRepository } from "../database/repositories/prisma-reports-repository.ts";

export function makeFetchReportsUseCase() {
  const reportsRepository = new PrismaReportsRepository()
  return new FetchReportsUseCase(reportsRepository)
}