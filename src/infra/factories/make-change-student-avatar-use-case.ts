import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { ChangeStudentAvatarUseCase } from "@/domain/boletim/app/use-cases/change-student-avatar.ts";

export function makeChangeStudentAvatarUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  return new ChangeStudentAvatarUseCase(
    studentsRepository,
  )
}