import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Assessment } from "@/domain/enterprise/entities/assessment.ts";
import { faker } from "@faker-js/faker";

export function makeAssessment(
  override: Partial<Assessment> = {},
  id?: UniqueEntityId
) {
  return Assessment.create({
    studentId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    poleId: new UniqueEntityId(),
    disciplineId: new UniqueEntityId(),
    vf: faker.number.int(),
    avi: 0,
    avii: 0,
    vfe: null,
    ...override
  }, id)
}