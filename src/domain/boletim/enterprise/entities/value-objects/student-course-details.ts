import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";
import { Formula } from "../course.ts";

interface StudentCourseDetailsProps {
  studentId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date

  courseId: UniqueEntityId
  course: string
  formula: Formula

  poleId: UniqueEntityId
  pole: string

  loginConfirmed?: boolean
  birthday: Date
  civilId: string
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

  static create(props: StudentCourseDetailsProps) {
    return new StudentCourseDetails(props)
  }
}