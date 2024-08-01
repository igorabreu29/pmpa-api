import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { DeleteManagerUseCase } from "@/domain/boletim/app/use-cases/delete-manager.ts";

export function makeDeleteManagerUseCase() {
  const managersRepository = new PrismaManagersRepository()
  return new DeleteManagerUseCase(managersRepository)
}