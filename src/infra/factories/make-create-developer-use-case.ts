import { CreateDeveloperUseCase } from "@/domain/boletim/app/use-cases/create-developer.ts";
import { PrismaDevelopersRepository } from "../database/repositories/prisma-developers-repository.ts";

export function makeCreateDeveloperUseCase() {
  const developersRepository = new PrismaDevelopersRepository()

  return new CreateDeveloperUseCase (
    developersRepository,
  )
}