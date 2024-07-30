import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface ManagerWithCourseProps {
  managerId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date

  courseId: UniqueEntityId
  course: string
  imageUrl: string
}

export class ManagerWithCourse extends ValueObject<ManagerWithCourseProps> {
  get managerId() {
    return this.props.managerId
  }

  get username() {
    return this.props.username
  }
  
  get email() {
    return this.props.email
  }

  get cpf() {
    return this.props.cpf
  }

  get courseId() {
    return this.props.courseId
  }

  get course() {
    return this.props.course
  }

  get assignedAt() {
    return this.props.assignedAt
  }

  static create(props: ManagerWithCourseProps) {
    return new ManagerWithCourse(props)
  }
}