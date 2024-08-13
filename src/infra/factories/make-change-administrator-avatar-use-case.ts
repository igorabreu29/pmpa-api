import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";
import { ChangeAdministratorAvatarUseCase } from "@/domain/boletim/app/use-cases/change-administrator-avatar.ts";

export function makeChangeAdministratorAvatarUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new ChangeAdministratorAvatarUseCase(
    administratorsRepository,
  )
}