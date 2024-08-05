import { ChangeStudentProfileUseCase } from "@/domain/boletim/app/use-cases/change-student-profile.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function changeStudentProfileUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  return new ChangeStudentProfileUseCase(
    studentsRepository
  )
}