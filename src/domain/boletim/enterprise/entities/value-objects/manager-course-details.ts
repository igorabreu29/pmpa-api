import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";
import type { Parent } from "@/core/types/student.ts";

interface ManagerCourseDetailsProps {
  managerId: UniqueEntityId
  username: string
  email: string
  cpf: string
  birthday: Date
  assignedAt: Date
  civilId?: string
  militaryId?: string
  state?: string
  county?: string
  parent?: Parent

  isActive?: boolean
  reason?: string

  courseId: UniqueEntityId
  course: string

  poleId: UniqueEntityId
  pole: string
}

export class ManagerCourseDetails extends ValueObject<ManagerCourseDetailsProps> {
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

  get birthday() {
    return this.props.birthday
  }

  get courseId() {
    return this.props.courseId
  }

  get course() {
    return this.props.course
  }
  
  get civilId() {
    return this.props.militaryId
  }

  get militaryId() {
    return this.props.militaryId
  }

  get state() {
    return this.props.state
  }

  get county() {
    return this.props.county
  }

  get parent() {
    return this.props.parent
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

  get isActive() {
    return this.props.isActive
  }

  get reason() {
    return this.props.reason
  }

  static create(props: ManagerCourseDetailsProps) {
    return new ManagerCourseDetails(props)
  }
}