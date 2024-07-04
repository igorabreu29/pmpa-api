import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

export type StudentRole = 'student'

interface Parent {
  motherName: string | undefined
  fatherName: string | undefined
}

interface Document {
  militaryID?: number
  civilID?: number
}

interface StudentProps {
  username: string
  email: string
  passwordHash: string
  cpf: string
  role: StudentRole
  active: boolean
  avatarUrl?: string | null
  birthday: Date 
  createdAt: Date

  loginConfirmation: boolean

  parent?: Parent
  documents?: Document

  state?: string
  county?: string
}

export class Student extends Entity<StudentProps> {
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

  get birthday() {
    return this.props.birthday
  }
  set birthday(value) {
    this.props.birthday = value
  }

  get active() {
    return this.props.active
  }
  set active(value) {
    this.props.active = value
  }

  get loginConfirmation() {
    return this.props.loginConfirmation
  }
  set loginConfirmation(value) {
    this.props.loginConfirmation = value
  }

  get parent() {
    return this.props.parent
  }
  set parent(value) {
    this.props.parent = value
  }

  get documents() {
    return this.props.documents
  }
  set documents(value) {
    this.props.documents = value
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

  static create(props: Optional<StudentProps, 'createdAt' | 'loginConfirmation' | 'role' | 'active'>, id?: UniqueEntityId) {
    return new Student({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      avatarUrl: props.avatarUrl ?? null,
      loginConfirmation: props.loginConfirmation ?? false,
      role: props.role ?? 'student',
      active: props.active ?? true
    }, id)
  }
}