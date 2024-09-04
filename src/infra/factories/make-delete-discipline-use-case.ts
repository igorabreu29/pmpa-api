import { DeleteDisciplineUseCase } from "@/domain/boletim/app/use-cases/delete-discipline.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";

export function makeDeleteDisciplineUseCase() {
  const disciplinesRepository = new PrismaDisciplinesRepository()
  return new DeleteDisciplineUseCase(disciplinesRepository)
}