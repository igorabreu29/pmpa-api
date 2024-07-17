import { Either, left, right } from "@/core/either.ts"
import { ValueObject } from "@/core/entities/value-object.ts"
import { InvalidPasswordError } from "@/core/errors/domain/invalid-password.ts"

interface PasswordProps {
  password: string
}

export class Password extends ValueObject<PasswordProps> {
  get value(): string {
    return this.props.password
  }

  public static validate(password: string): boolean {
    if (!password || 
      password.trim().length < 6 ||
      password.trim().length > 30
    ) {
      return false
    }

    return true
  }
  
  static create(password: string): Either<InvalidPasswordError, Password> {
    if (!this.validate(password)) {
      return left(new InvalidPasswordError(password))
    }

    return right(new Password({ password }))
  }
}