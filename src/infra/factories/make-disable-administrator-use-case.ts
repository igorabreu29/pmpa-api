import { DisableAdministratorUseCase } from "@/domain/boletim/app/use-cases/disable-administrator.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeDisableAdministratorUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new DisableAdministratorUseCase(administratorsRepository)
}