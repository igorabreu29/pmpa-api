import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Classification } from "@/domain/boletim/enterprise/entities/classification.ts";

export function makeClassification(
  override: Partial<Classification> = {},
  id?: UniqueEntityId
) {
  const classification = Classification.create({
    studentId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    poleId: new UniqueEntityId(),
    average: 10,
    assessmentsCount: 3,
    behaviorsCount: 0,
    concept: 'good',
    status: 'approved',
    assessments: [],
    studentBirthday: new Date(),
    ...override
  }, id)
  
  return classification
}