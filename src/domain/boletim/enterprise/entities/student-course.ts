import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

interface StudentCourseProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  active: boolean
  createdAt: Date
}

export class StudentCourse extends Entity<StudentCourseProps> {
  get studentId() {
    return this.props.studentId
  }

  get courseId() {
    return this.props.courseId
  }

  get active() {
    return this.props.active
  }
  set active(value) {
    this.props.active = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<StudentCourseProps, 'createdAt'>, id?: UniqueEntityId) {
    return new StudentCourse({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)
  }
}