import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { EndsAt } from "@/domain/boletim/enterprise/entities/value-objects/ends-at.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { faker } from "@faker-js/faker";

export function makeCourse(
  override: Partial<Course> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.person.fullName())
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