import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentCourse, StudentCourseProps } from "@/domain/boletim/enterprise/entities/student-course.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { PrismaStudentCourseMapper } from "@/infra/database/mappers/prisma-student-course-mapper.ts";

export function makeStudentCourse(
  override: Partial<StudentCourse> = {},
  id?: UniqueEntityId
) {
  return StudentCourse.create({
    courseId: new UniqueEntityId(),
    studentId: new UniqueEntityId(),
    isActive: true,
    ...override
  }, id)
}

export async function makePrismaStudentCourse(
  data: Partial<StudentCourseProps> = {}
) {
  const studentCourse = makeStudentCourse(data)

  await prisma.userOnCourse.create({
    data: PrismaStudentCourseMapper.toPrisma(studentCourse)
  })

  return studentCourse
}