import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ManagerCourse, ManagerCourseProps } from "@/domain/boletim/enterprise/entities/manager-course.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { PrismaManagersCoursesMapper } from "@/infra/database/mappers/prisma-managers-courses-mapper.ts";

export function makeManagerCourse(
  override: Partial<ManagerCourse> = {},
  id?: UniqueEntityId
) {
  return ManagerCourse.create({
    courseId: new UniqueEntityId(),
    managerId: new UniqueEntityId(),
    isActive: true,
    ...override
  }, id)
}

export async function makePrismaManagerCourse(
  data: Partial<ManagerCourseProps> = {}
) {
  const managerCourse = makeManagerCourse(data)

  await prisma.userOnCourse.create({
    data: PrismaManagersCoursesMapper.toPrisma(managerCourse)
  })

  return managerCourse
}