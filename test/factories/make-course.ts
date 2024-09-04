import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Course, CourseProps } from "@/domain/boletim/enterprise/entities/course.ts";
import { EndsAt } from "@/domain/boletim/enterprise/entities/value-objects/ends-at.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { PrismaCoursesMapper } from "@/infra/database/mappers/prisma-courses-mapper.ts";
import { faker } from "@faker-js/faker";

export function makeCourse(
  override: Partial<Course> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.lorem.slug())
  if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

  const endsAt = new Date()
  endsAt.setMinutes(new Date().getMinutes() + 10)

  const endsAtOrError = EndsAt.create(endsAt)
  if (endsAtOrError.isLeft()) throw new Error(endsAtOrError.value.message)

  const course = Course.create({
    formula: 'CAS',
    name: nameOrError.value,
    imageUrl: faker.internet.url(),
    endsAt: endsAtOrError.value,
    ...override
  }, id)

  if (course.isLeft()) throw new Error('Invalid course')
  return course.value
}

export async function makePrismaCourse(
  data: Partial<CourseProps> = {}
){
  const endsAt = new Date()
  endsAt.setMinutes(new Date().getMinutes() + 10)

  const nameOrError = Name.create(data.name?.value ?? faker.lorem.slug())
  if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

  const endsAtOrError = EndsAt.create(endsAt)
  if (endsAtOrError.isLeft()) throw new Error(endsAtOrError.value.message)

  const course = makeCourse({
    ...data,
    name: nameOrError.value,
    endsAt: endsAtOrError.value,
    formula: data.formula ?? 'CAS',
  })

  await prisma.course.create({
    data: PrismaCoursesMapper.toPrisma(course)
  })

  return course
}