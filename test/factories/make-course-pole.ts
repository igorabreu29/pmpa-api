import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { CoursePole } from "@/domain/enterprise/entities/course-pole.ts";

export function makeCoursePole(
  override: Partial<CoursePole> = {},
  id?: UniqueEntityId
) {
  return CoursePole.create({
    courseId: new UniqueEntityId(),
    poleId: new UniqueEntityId(),
    ...override
  }, id)
}