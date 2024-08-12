import { FetchDisciplinesUseCase } from "@/domain/boletim/app/use-cases/fetch-disciplines.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";

export function makeFetchDisciplinesUseCase() {
  const disciplinesRepository = new PrismaDisciplinesRepository()
  return new FetchDisciplinesUseCase(
    disciplinesRepository
  )
}