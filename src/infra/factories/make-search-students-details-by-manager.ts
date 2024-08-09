import { SearchStudentsDetailsManagerUseCase } from "@/domain/boletim/app/use-cases/search-students-details-by-manager.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { PrismaStudentsPolesRepository } from "../database/repositories/prisma-students-poles-repository.ts";

export function makeSearchStudentDetailsByManagerUseCase() {
  const managersRepository = new PrismaManagersRepository()
  const studentPolesRepository = new PrismaStudentsPolesRepository()
  return new SearchStudentsDetailsManagerUseCase(
    managersRepository,
    studentPolesRepository
  )
}