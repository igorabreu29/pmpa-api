import { ActiveAdministratorUseCase } from "@/domain/boletim/app/use-cases/active-administrator.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeActiveAdministratorUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new ActiveAdministratorUseCase(administratorsRepository)
}