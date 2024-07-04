import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { AssessmentBatch } from "@/domain/boletim/enterprise/entities/assessment-batch.ts";
import { faker } from "@faker-js/faker";

export function makeAssessmentBatch (
  override: Partial<AssessmentBatch> = {},
  id?: UniqueEntityId
) {
  return AssessmentBatch.create({
    userId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    assessments: [],
    userIP: faker.internet.ip(),
    ...override
  })
}