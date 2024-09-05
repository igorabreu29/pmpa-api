import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts"

export interface WriteProps {
  courseId: UniqueEntityId
  students: StudentCourseDetails[]
}

export interface Sheeter {
  write: ({ courseId, students }: WriteProps) => string
}