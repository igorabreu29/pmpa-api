import { MarkLoginConfirmedAsTrueAndUpdateStudent } from "@/domain/boletim/app/use-cases/mark-login-confirmed-as-true-and-update-student.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeMarkLoginConfirmedAsTrueAndUpdateStudentUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  return new MarkLoginConfirmedAsTrueAndUpdateStudent(
    studentsRepository
  )
}