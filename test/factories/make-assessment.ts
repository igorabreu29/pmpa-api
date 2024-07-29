import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";

export function makeAssessment(
  override: Partial<Assessment> = {},
  id?: UniqueEntityId
) {
  const assessmentOrError = Assessment.create({
    studentId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    disciplineId: new UniqueEntityId(),
    vf: 8,
    avi: null,
    avii: null,
    vfe: null,
    ...override
  }, id)
  
  if (assessmentOrError.isLeft()) throw new Error(assessmentOrError.value.message)
  return assessmentOrError.value
}