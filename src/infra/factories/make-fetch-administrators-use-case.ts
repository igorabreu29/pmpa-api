import { FetchAdministratorsUseCase } from "@/domain/boletim/app/use-cases/fetch-administrators.ts";
import { PrismaAdministratorsRepository } from "../database/repositories/prisma-administrators-repository.ts";

export function makeFetchAdministratorsUseCase() {
  const administratorsRepository = new PrismaAdministratorsRepository()
  return new FetchAdministratorsUseCase(administratorsRepository)
}