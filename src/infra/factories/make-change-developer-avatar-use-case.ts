import { PrismaDevelopersRepository } from "../database/repositories/prisma-developers-repository.ts";
import { ChangeDeveloperAvatarUseCase } from "@/domain/boletim/app/use-cases/change-developer-avatar.ts";

export function makeChangeDeveloperAvatarUseCase() {
  const developersRepository = new PrismaDevelopersRepository()
  return new ChangeDeveloperAvatarUseCase(
    developersRepository,
  )
}