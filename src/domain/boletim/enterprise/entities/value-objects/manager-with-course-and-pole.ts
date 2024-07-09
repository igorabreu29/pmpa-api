import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface ManagerWithCourseAndPoleProps {
  managerId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date

  courseId: UniqueEntityId
  course: string

  poleId: UniqueEntityId
  pole: string
}

export class ManagerWithCourseAndPole extends ValueObject<ManagerWithCourseAndPoleProps> {
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

  get poleId() {
    return this.props.poleId
  }

  get pole() {
    return this.props.pole
  }

  get assignedAt() {
    return this.props.assignedAt
  }

  static create(props: ManagerWithCourseAndPoleProps) {
    return new ManagerWithCourseAndPole(props)
  }
}