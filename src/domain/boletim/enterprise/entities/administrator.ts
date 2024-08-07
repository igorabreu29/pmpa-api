import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { Optional } from "@/core/types/optional.ts"
import { Name } from "./value-objects/name.ts"
import { Email } from "./value-objects/email.ts"
import { CPF } from "./value-objects/cpf.ts"
import { Birthday } from "./value-objects/birthday.ts"
import { Password } from "./value-objects/password.ts"
import { Either, right } from "@/core/either.ts"
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts"
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts"
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts"
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"
import { AggregateRoot } from "@/core/entities/aggregate-root.ts"
import { DomainEvent } from "@/core/events/domain-event.ts"

export type AdministratorRole = 'admin'

interface AdministratorProps {
  username: Name
  email: Email
  passwordHash: Password
  cpf: CPF
  role: AdministratorRole
  avatarUrl?: string | null
  createdAt: Date

  civilId: number
  birthday: Birthday
}


export class Administrator extends AggregateRoot<AdministratorProps> {
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
  set cpf(value) {
    this.props.cpf = value
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

  get createdAt() {
    return this.props.createdAt
  }

  public addDomainAdministratorEvent(domainEvent: DomainEvent): void {
    this.addDomainEvent(domainEvent)
  }

  static create(
    props: Optional<AdministratorProps, 'createdAt' | 'role'>, 
    id?: UniqueEntityId
  ): Either<
      | InvalidNameError
      | InvalidCPFError
      | InvalidBirthdayError
      | InvalidEmailError
      | InvalidPasswordError,
      Administrator
    > {
    const administrator = new Administrator({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      avatarUrl: props.avatarUrl ?? null,
      role: props.role ?? 'admin',
    }, id)

    return right(administrator)
  }
}