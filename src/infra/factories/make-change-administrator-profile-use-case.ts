import { ChangeAdministratorProfileUseCase } from "@/domain/boletim/app/use-cases/change-administrator-profile.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeChangeAdministratorProfileUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new ChangeAdministratorProfileUseCase(
    administratorsRepository
  )
}