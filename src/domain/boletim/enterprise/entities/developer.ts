import { Entity } from "@/core/entities/entity.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { Optional } from "@/core/types/optional.ts"

export type DeveloperRole = 'dev'

interface DeveloperProps {
  username: string
  email: string
  passwordHash: string
  cpf: string
  role: DeveloperRole
  active: boolean
  avatarUrl?: string | null
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

  get active() {
    return this.props.active
  }
  set active(value) {
    this.props.active = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<DeveloperProps, 'createdAt' | 'role' | 'active'>, id?: UniqueEntityId) {
    return new Developer({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      avatarUrl: props.avatarUrl ?? null,
      role: props.role ?? 'dev',
      active: props.active ?? true
    }, id)
  }
}