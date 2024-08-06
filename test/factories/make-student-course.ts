import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";

export function makeStudentCourse(
  override: Partial<StudentCourse> = {},
  id?: UniqueEntityId
) {
  return StudentCourse.create({
    courseId: new UniqueEntityId(),
    studentId: new UniqueEntityId(),
    active: true,
    ...override
  }, id)
}