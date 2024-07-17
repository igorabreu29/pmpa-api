import { Either, left, right } from "@/core/either.ts"
import { ValueObject } from "@/core/entities/value-object.ts"
import { InvalidBirthdayError } from "@/core/errors/domain/invalid-birthday.ts"
import dayjs from "dayjs"

interface BirthdayProps {
  birthday: Date
}

export class Birthday extends ValueObject<BirthdayProps> {
  get value(): Date {
    return this.props.birthday
  }

  static validate(birthday: Date): boolean {
    if (
      !birthday ||
      dayjs(birthday).isAfter(new Date())
    ) {
      return false
    }

    const age = dayjs(new Date()).diff(birthday, 'year')
    if (age < 18) return false

    return true
  }

  static create(birthday: Date): Either<InvalidBirthdayError, Birthday> {
    if (!this.validate(birthday)) {
      return left(new InvalidBirthdayError())
    }

    return right(new Birthday({ birthday }))
  }
}