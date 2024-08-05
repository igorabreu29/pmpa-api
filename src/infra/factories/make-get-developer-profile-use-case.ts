import { GetDeveloperProfileUseCase } from "@/domain/boletim/app/use-cases/get-developer-profile.ts";
import { PrismaDevelopersRepository } from "../database/repositories/prisma-developers-repository.ts";

export function makeGetDeveloperProfileUseCase() {
  const developersRepository = new PrismaDevelopersRepository()
  return new GetDeveloperProfileUseCase(
    developersRepository
  )
}