import { SearchUseCase } from "@/domain/boletim/app/use-cases/search.ts";
import { PrismaSearchsRepository } from "../database/repositories/prisma-searchs-repository.ts";

export function makeSearchUseCase() {
  const searchsRepository = new PrismaSearchsRepository()
  return new SearchUseCase(searchsRepository)
}