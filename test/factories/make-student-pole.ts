import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentPole, StudentPoleProps } from "@/domain/boletim/enterprise/entities/student-pole.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { PrismaStudentPoleMapper } from "@/infra/database/mappers/prisma-student-pole-mapper.ts";

export function makeStudentPole(
  override: Partial<StudentPole> = {},
  id?: UniqueEntityId
) {
  return StudentPole.create({
    poleId: new UniqueEntityId(),
    studentId: new UniqueEntityId(),
    ...override
  }, id)
}

export async function makePrismaStudentPole(
  data: Partial<StudentPoleProps> = {}
) {
  const studentPole = makeStudentPole(data)

  await prisma.userCourseOnPole.create({
    data: PrismaStudentPoleMapper.toPrisma(studentPole)
  })

  return studentPole
}