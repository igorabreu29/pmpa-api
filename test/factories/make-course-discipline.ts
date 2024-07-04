import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { CourseDiscipline } from "@/domain/boletim/enterprise/entities/course-discipline.ts";
 
export function makeCourseDiscipline(
  override: Partial<CourseDiscipline> = {},
  id?: UniqueEntityId
) {
  return CourseDiscipline.create({
    courseId: new UniqueEntityId(),
    disciplineId: new UniqueEntityId(),
    module: 1,
    expected: 'VF',
    hours: 30,
    weight: 1,
    ...override
  }, id)
}