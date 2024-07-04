import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

export type ManagerRole = 'manager'

interface ManagerProps {
  username: string
  email: string
  passwordHash: string
  cpf: string
  role: ManagerRole
  active: boolean
  avatarUrl?: string | null
  createdAt: Date

  civilID?: number
  birthday: Date
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

  static create(props: Optional<ManagerProps, 'createdAt' | 'role' | 'active'>, id?: UniqueEntityId) {
    return new Manager({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      active: props.active ?? true,
      avatarUrl: props.avatarUrl ?? null,
      role: props.role ?? 'manager'
    }, id)
  }
}