import { CreateAdminUseCase } from "@/domain/boletim/app/use-cases/create-administrator.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeCreateAdministratorUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()

  return new CreateAdminUseCase (
    administratorsRepository,
  )
}