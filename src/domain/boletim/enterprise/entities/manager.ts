import { Either, right } from "@/core/either.ts";
import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import { Optional } from "@/core/types/optional.ts";
import type { Parent } from "@/core/types/student.ts";
import { Birthday } from "./value-objects/birthday.ts";
import { CPF } from "./value-objects/cpf.ts";
import { Email } from "./value-objects/email.ts";
import { Name } from "./value-objects/name.ts";
import { Password } from "./value-objects/password.ts";
import { AggregateRoot } from "@/core/entities/aggregate-root.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";

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
  birthday: Birthday

  parent?: Parent

  civilId: number
  militaryId?: number

  state?: string
  county?: string
}

export class Manager extends AggregateRoot<ManagerProps> {
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

  get active() {
    return this.props.active
  }
  set active(value) {
    this.props.active = value
  }

  get parent() {
    return this.props.parent
  }
  set parent(value) {
    this.props.parent = value
  }

  get civilId() {
    return this.props.civilId
  }
  set civilId(value) {
    this.props.civilId = value
  }

  get militaryId() {
    return this.props.militaryId
  }
  set militaryId(value) {
    this.props.militaryId = value
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

  public addDomainManagerEvent(domainEvent: DomainEvent): void {
    this.addDomainEvent(domainEvent)
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