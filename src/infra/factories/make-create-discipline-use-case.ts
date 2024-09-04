import { CreateDisciplineUseCase } from "@/domain/boletim/app/use-cases/create-discipline.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";

export function makeCreateDisciplineUseCase() {
  const disciplinesRepository = new PrismaDisciplinesRepository()
  return new CreateDisciplineUseCase(disciplinesRepository)
}