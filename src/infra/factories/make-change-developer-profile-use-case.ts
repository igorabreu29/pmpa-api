import { ChangeDeveloperProfileUseCase } from "@/domain/boletim/app/use-cases/change-developer-profile.ts";
import { PrismaDevelopersRepository } from "../database/repositories/prisma-developers-repository.ts";

export function changeDeveloperProfileUseCase() {
  const developersRepository = new PrismaDevelopersRepository()
  return new ChangeDeveloperProfileUseCase(
    developersRepository
  )
}