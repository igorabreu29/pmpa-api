import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";
import { faker } from '@faker-js/faker'
 
export function makeCourseHistoric(
  override: Partial<CourseHistoric> = {},
  id?: UniqueEntityId
) {
  return CourseHistoric.create({
    courseId: new UniqueEntityId(),
    className: faker.company.name(),
    startDate: new Date(2023, 1, 20),
    finishDate: new Date(2024, 2, 20),
    commander: faker.person.firstName(),
    divisionBoss: faker.person.firstName(),
    totalHours: faker.number.int(),
    speechs: faker.number.int(),
    internships: faker.number.int(),
    ...override
  }, id)
}