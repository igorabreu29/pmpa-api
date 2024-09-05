import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";
import { Formula } from "../course.ts";
import type { Parent } from "@/core/types/student.ts";

interface StudentCourseDetailsProps {
  studentId: UniqueEntityId
  username: string
  email: string
  cpf: string
  birthday: Date
  civilId: string
  assignedAt: Date
  loginConfirmed?: boolean
  militaryId?: string
  state?: string
  county?: string
  parent?: Parent

  courseId: UniqueEntityId
  course: string
  formula: Formula

  poleId: UniqueEntityId
  pole: string
}

export class StudentCourseDetails extends ValueObject<StudentCourseDetailsProps> {
  get studentId() {
    return this.props.studentId
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

  get formula() {
    return this.props.formula
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

  get birthday() {
    return this.props.birthday
  }

  get civilId() {
    return this.props.civilId
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

  static create(props: StudentCourseDetailsProps) {
    return new StudentCourseDetails(props)
  }
}