import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { CoursePole } from "@/domain/boletim/enterprise/entities/course-pole.ts";
import { faker } from "@faker-js/faker";

export function makeCoursePole(
  override: Partial<CoursePole> = {},
  id?: UniqueEntityId
) {
  return CoursePole.create({
    courseId: new UniqueEntityId(),
    poleId: new UniqueEntityId(),
    managerName: faker.person.firstName(),
    ...override
  }, id)
}