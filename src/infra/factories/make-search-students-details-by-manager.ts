import { SearchStudentsDetailsManagerUseCase } from "@/domain/boletim/app/use-cases/search-students-details-by-manager.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { PrismaSearchsRepository } from "../database/repositories/prisma-searchs-repository.ts";

export function makeSearchStudentDetailsByManagerUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const searchsRepository = new PrismaSearchsRepository()
  return new SearchStudentsDetailsManagerUseCase(
    managersRepository,
    searchsRepository
  )
}