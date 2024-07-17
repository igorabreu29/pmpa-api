import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { Name } from "./value-objects/name.ts";
import { Email } from "./value-objects/email.ts";
import { Password } from "./value-objects/password.ts";
import { CPF } from "./value-objects/cpf.ts";
import { Birthday } from "./value-objects/birthday.ts";
import { Either, right } from "@/core/either.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";

export type ManagerRole = 'manager'

interface ManagerProps {
  username: Name
  email: Email
  passwordHash: Password
  cpf: CPF
  role: ManagerRole
  active: boolean
  avatarUrl?: string | null
  createdAt: Date

  civilID: number
  birthday: Birthday
}

export class Manager extends Entity<ManagerProps> {
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

  get active() {
    return this.props.active
  }
  set active(value) {
    this.props.active = value
  }

  get civilID() {
    return this.props.civilID
  }
  set civilID(value) {
    this.props.civilID = value
  }

  get birthday() {
    return this.props.birthday
  }
  set birthday(value) {
    this.props.birthday = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ManagerProps, 'createdAt' | 'role' | 'active'>, 
    id?: UniqueEntityId
  ): Either<
      | InvalidNameError
      | InvalidCPFError
      | InvalidBirthdayError
      | InvalidEmailError
      | InvalidPasswordError,
      Manager
    > {
    const manager = new Manager({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      active: props.active ?? true,
      avatarUrl: props.avatarUrl ?? null,
      role: props.role ?? 'manager'
    }, id)

    return right(manager)
  }
}