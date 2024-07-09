import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface StudentCourseWithCourseProps {
  studentCourseId: UniqueEntityId
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  course: string
  courseImageUrl: string
}

export class StudentCourseWithCourse extends ValueObject<StudentCourseWithCourseProps> {
  get studentCourseId() {
    return this.props.studentCourseId
  }

  get studentId() {
    return this.props.studentId
  }

  get course() {
    return this.props.course
  }

  get courseImageUrl() {
    return this.props.courseImageUrl
  }

  get courseId() {
    return this.props.courseId
  }

  static create(props: StudentCourseWithCourseProps) {
    return new StudentCourseWithCourse(props)
  }
}