import { Either, left, right } from "@/core/either.ts"
import { ValueObject } from "@/core/entities/value-object.ts"
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts"

interface NameProps {
  name: string
}

export class Name extends ValueObject<NameProps> {
  get value(): string {
    return this.props.name
  }

  public static validate(name: string): boolean {
    if (!name || 
      name.trim().length > 255
    ) {
      return false
    }

    return true
  }

  static create(name: string): Either<InvalidNameError, Name> {
    if (!this.validate(name)) {
      return left(new InvalidNameError('Nome inválido!'))
    }

    return right(new Name({ name }))
  }
}