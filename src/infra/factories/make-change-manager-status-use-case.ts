import { ChangeManagerStatusUseCase } from "@/domain/boletim/app/use-cases/change-manager-status.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";

export function makeChangeManagerStatusUseCase() {
  const managersRepository = new PrismaManagersRepository()
  return new ChangeManagerStatusUseCase(managersRepository)
}