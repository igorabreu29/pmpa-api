import { DeleteAdministratorUseCase } from "@/domain/boletim/app/use-cases/delete-administrator.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeDeleteAdministratorUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new DeleteAdministratorUseCase(administratorsRepository)
}