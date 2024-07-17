import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";
import { Course } from "../course.ts";
import { Pole } from "../pole.ts";

interface StudentDetailsProps {
  studentId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date
  birthday: Date
  civilID: number

  courses: Course[]
  poles: Pole[]
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

  get civilID() {
    return this.props.civilID
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