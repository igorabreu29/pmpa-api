import { GetManagerProfileUseCase } from "@/domain/boletim/app/use-cases/get-manager-profile.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";

export function makeGetManagerProfileUseCase() {
  const managersRepository = new PrismaManagersRepository()
  return new GetManagerProfileUseCase(
    managersRepository
  )
}