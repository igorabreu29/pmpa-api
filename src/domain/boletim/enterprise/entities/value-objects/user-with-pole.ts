import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface UserWithPoleProps {
  userId: UniqueEntityId
  username: string
  email: string
  cpf: string
  civilID?: number
  role: string
  active: boolean
  poleId: UniqueEntityId
  pole: string
  birthday?: Date
}

export class UserWithPole extends ValueObject<UserWithPoleProps> {
  get userId() {
    return this.props.userId
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

  get role() {
    return this.props.role
  }
  
  get active() {
    return this.props.active
  }

  get poleId() {
    return this.props.poleId
  }

  get pole() {
    return this.props.pole
  }

  get civilID() {
    return this.props.civilID
  }

  get birthday() {
    return this.props.birthday
  }

  static create(props: UserWithPoleProps) {
    return new UserWithPole(props)
  }
}