import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { UserCourse } from "@/domain/boletim/enterprise/entities/user-course.ts";

export function makeUserCourse(
  override: Partial<UserCourse> = {},
  id?: UniqueEntityId
) {
  return UserCourse.create({
    courseId: new UniqueEntityId(),
    userId: new UniqueEntityId(),
    ...override
  }, id)
}