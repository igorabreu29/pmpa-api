import { DeleteStudentUseCase } from "@/domain/boletim/app/use-cases/delete-student.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeDeleteStudentUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  return new DeleteStudentUseCase(studentsRepository)
}