import { GetAdministratorProfileUseCase } from "@/domain/boletim/app/use-cases/get-administrator-profile.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeGetAdministratorProfileUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new GetAdministratorProfileUseCase(
    administratorsRepository
  )
}