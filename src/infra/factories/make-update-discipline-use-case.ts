import { UpdateDisciplineUseCase } from "@/domain/boletim/app/use-cases/update-discipline.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";

export function makeUpdateDisciplineUseCase() {
  const disciplinesRepository = new PrismaDisciplinesRepository()
  return new UpdateDisciplineUseCase(disciplinesRepository)
}