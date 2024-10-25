import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";
import { Course } from "../course.ts";
import { Pole } from "../pole.ts";
import { Role } from "../authenticate.ts";
import { Parent } from "@/core/types/student.ts";

export interface StudentDetailsCourse {
  studentCourseId: UniqueEntityId
  course: Course
}

export interface StudentDetailsPole {
  studentPoleId: UniqueEntityId
  pole: Pole
}

interface StudentDetailsProps {
  studentId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date
  birthday: Date
  civilId: string
  avatarUrl?: string
  role: Role

  militaryId?: string
  state?: string
  county?: string
  parent?: Parent


  courses: StudentDetailsCourse[]
  poles: StudentDetailsPole[]
}

export class StudentDetails extends ValueObject<StudentDetailsProps> {
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

  get assignedAt() {
    return this.props.assignedAt
  }

  get birthday() {
    return this.props.birthday
  }

  get civilId() {
    return this.props.civilId
  }

  get avatarUrl() {
    return this.props.avatarUrl
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

  get courses() {
    return this.props.courses
  }

  get poles() {
    return this.props.poles
  }

  static create(props: StudentDetailsProps) {
    return new StudentDetails(props)
  }
}