import { GetStudentProfileUseCase } from "@/domain/boletim/app/use-cases/get-student-profile.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";

export function makeGetStudentProfileUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  return new GetStudentProfileUseCase(
    studentsRepository
  )
}