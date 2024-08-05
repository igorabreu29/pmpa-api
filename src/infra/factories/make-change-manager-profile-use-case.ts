import { ChangeManagerProfileUseCase } from "@/domain/boletim/app/use-cases/change-manager-profile.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";

export function changeManagerProfileUseCase() {
  const managersRepository = new PrismaManagersRepository()
  return new ChangeManagerProfileUseCase(
    managersRepository
  )
}