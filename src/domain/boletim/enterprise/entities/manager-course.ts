import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

interface ManagerCourseProps {
  managerId: UniqueEntityId
  courseId: UniqueEntityId
  createdAt: Date
}

export class ManagerCourse extends Entity<ManagerCourseProps> {
  get managerId() {
    return this.props.managerId
  }

  get courseId() {
    return this.props.courseId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<ManagerCourseProps, 'createdAt'>, id?: UniqueEntityId) {
    return new ManagerCourse({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)
  }
}