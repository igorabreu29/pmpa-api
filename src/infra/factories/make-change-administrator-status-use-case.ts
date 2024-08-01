import { ChangeAdministratorStatusUseCase } from "@/domain/boletim/app/use-cases/change-administrator-status.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeChangeAdministratorStatusUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new ChangeAdministratorStatusUseCase(administratorsRepository)
}