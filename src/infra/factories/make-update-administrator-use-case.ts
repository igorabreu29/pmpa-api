import { UpdateAdministratorUseCase } from "@/domain/boletim/app/use-cases/update-administrator.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeUpdateAdministratorUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()

  return new UpdateAdministratorUseCase (
    administratorsRepository,
  )
}