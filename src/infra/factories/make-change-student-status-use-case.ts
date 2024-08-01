import { ChangeStudentStatusUseCase } from "@/domain/boletim/app/use-cases/change-student-status.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeChangeStudentStatusUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  return new ChangeStudentStatusUseCase(studentsRepository)
}