import { FetchPolesUseCase } from "@/domain/boletim/app/use-cases/fetch-poles.ts";
import { PrismaPolesRepository } from "../database/repositories/prisma-poles-repository.ts";

export function makeFetchPolesUseCase() {
  const polesRepository = new PrismaPolesRepository()
  return new FetchPolesUseCase(
    polesRepository
  )
}