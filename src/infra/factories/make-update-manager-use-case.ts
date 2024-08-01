import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { UpdateManagerUseCase } from "@/domain/boletim/app/use-cases/update-manager.ts";

export function makeUpdateManagerUseCase() {
  const managersRepository = new PrismaManagersRepository()

  return new UpdateManagerUseCase (
    managersRepository,
  )
}