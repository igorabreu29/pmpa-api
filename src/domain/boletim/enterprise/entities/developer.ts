import { Entity } from "@/core/entities/entity.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { Optional } from "@/core/types/optional.ts"
import { Name } from "./value-objects/name.ts"
import { Email } from "./value-objects/email.ts"
import { Password } from "./value-objects/password.ts"
import { CPF } from "./value-objects/cpf.ts"
import { Either, right } from "@/core/either.ts"
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts"
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts"
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts"
import { Parent } from "@/core/types/student.ts"
import { Birthday } from "./value-objects/birthday.ts"

export type DeveloperRole = 'dev'

export interface DeveloperProps {
  username: Name
  email: Email
  passwordHash: Password
  cpf: CPF
  role: DeveloperRole
  avatarUrl: string | null
  birthday: Birthday

  isActive: boolean
  parent?: Parent

  civilId: string
  militaryId?: string

  state?: string
  county?: string
  createdAt: Date
}

export class Developer extends Entity<DeveloperProps> {
  get username() {
    return this.props.username
  }
  set username(value) {
    this.props.username = value
  }
  
  get email() {
    return this.props.email
  }
  set email(value) {
    this.props.email = value
  }

  get passwordHash() {
    return this.props.passwordHash
  }
  set passwordHash(value) {
    this.props.passwordHash = value
  }

  get cpf() {
    return this.props.cpf
  }

  get avatarUrl() {
    return this.props.avatarUrl
  }
  set avatarUrl(value) {
    this.props.avatarUrl = value
  }

  get role() {
    return this.props.role
  }

  get isActive() {
    return this.props.isActive
  }
  set isActive(value) {
    this.props.isActive = value
  }

  get parent() {
    return this.props.parent
  }
  set parent(value) {
    this.props.parent = value
  }

  get militaryId() {
    return this.props.militaryId
  }
  set militaryId(value) {
    this.props.militaryId = value
  }

  get civilId() {
    return this.props.civilId
  }
  set civilId(value) {
   this.props.civilId = value
  }

  get birthday() {
    return this.props.birthday
  }
  set birthday(value) {
   this.props.birthday = value
  }

  get state() {
    return this.props.state
  }
  set state(value) {
    this.props.state = value
  }

  get county() {
    return this.props.county
  }
  set county(value) {
    this.props.county = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<DeveloperProps, 'createdAt' | 'role' | 'avatarUrl' | 'isActive'>, 
    id?: UniqueEntityId
  ): Either<
      | InvalidNameError
      | InvalidCPFError
      | InvalidEmailError
      | InvalidPasswordError
      | InvalidDateError,
      Developer
    > {
    const developer = new Developer({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      avatarUrl: props.avatarUrl ?? null,
      isActive: props.isActive ?? true,
      role: props.role ?? 'dev',
    }, id)

    return right(developer)
  }
}