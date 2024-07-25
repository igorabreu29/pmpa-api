import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface StudentWithPoleProps {
  studentId: UniqueEntityId
  username: string
  email: string
  cpf: string
  assignedAt: Date

  poleId: UniqueEntityId
  pole: string

  birthday: Date
  civilId: number
}

export class StudentWithPole extends ValueObject<StudentWithPoleProps> {
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

  static create(props: StudentWithPoleProps) {
    return new StudentWithPole(props)
  }
}