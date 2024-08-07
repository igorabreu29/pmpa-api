import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ManagerCourse } from "@/domain/boletim/enterprise/entities/manager-course.ts";

export function makeManagerCourse(
  override: Partial<ManagerCourse> = {},
  id?: UniqueEntityId
) {
  return ManagerCourse.create({
    courseId: new UniqueEntityId(),
    managerId: new UniqueEntityId(),
    isActive: true,
    ...override
  }, id)
}