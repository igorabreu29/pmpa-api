import { PrismaReportsRepository } from "../database/repositories/prisma-reports-repository.ts";
import { FetchManagerReportsUseCase } from "@/domain/boletim/app/use-cases/fetch-manager-reports.ts";

export function makeFetchManagerReportsUseCase() {
  const reportsRepository = new PrismaReportsRepository()
  return new FetchManagerReportsUseCase(reportsRepository)
}