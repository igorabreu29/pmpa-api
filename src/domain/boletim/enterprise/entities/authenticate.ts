import { Entity } from "@/core/entities/entity.ts";
import { CPF } from "./value-objects/cpf.ts";
import { Password } from "./value-objects/password.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Either, right } from "@/core/either.ts";
import { InvalidCPFError } from "@/core/errors/domain/invalid-cpf.ts";
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts";
import type { Email } from "./value-objects/email.ts";

export type Role = 'student' | 'manager' | 'admin' | 'dev'

interface AuthenticateProps {
  cpf: CPF
  email: Email
  passwordHash: Password
  role: Role
  isLoginConfirmed?: boolean
}

export class Authenticate extends Entity<AuthenticateProps> {
  get cpf() {
    return this.props.cpf
  }

  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }
  set passwordHash(value) {
    this.props.passwordHash = value
  }

  get role() {
    return this.props.role
  }

  get isLoginConfirmed() {
    return this.props.isLoginConfirmed
  }

  static create (
    props: AuthenticateProps,
    id?: UniqueEntityId
  ): Either<
    | InvalidCPFError
    | InvalidPasswordError,
    Authenticate  
  > {
    const authenticate = new Authenticate({
      ...props,
      isLoginConfirmed: props.isLoginConfirmed ?? false
    }, id)
    
    return right(authenticate)
  }
}