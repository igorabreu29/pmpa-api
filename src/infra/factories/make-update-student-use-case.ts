import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { UpdateStudentUseCase } from "@/domain/boletim/app/use-cases/update-student.ts";

export function makeUpdateStudentUseCase() {
  const studentsRepository = new PrismaStudentsRepository()

  return new UpdateStudentUseCase (
    studentsRepository,
  )
}