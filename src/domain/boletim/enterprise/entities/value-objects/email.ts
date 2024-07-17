import { Either, left, right } from "@/core/either.ts"
import { ValueObject } from "@/core/entities/value-object.ts"
import { InvalidEmailError } from "@/core/errors/domain/invalid-email.ts"

interface EmailProps {
  email: string
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.email
  }

  static validate(email: string): boolean {
    if (!email || email.trim().length > 255) {
      return false
    }

    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!regex.test(email)) {
      return false
    }

    return true
  }

  static format(email: string) {
    return email.trim().toLowerCase()
  }

  static create(email: string): Either<InvalidEmailError, Email> {
    if (!this.validate(email)) {
      return left(new InvalidEmailError())
    }

    const formattedEmail = this.format(email)

    return right(new Email({ email: formattedEmail }))
  }
}