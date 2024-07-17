import { Either, left, right } from "@/core/either.ts"
import { ValueObject } from "@/core/entities/value-object.ts"
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts"
import dayjs from "dayjs"

interface EndsAtProps {
  endsAt: Date
}

export class EndsAt extends ValueObject<EndsAtProps> {
  get value(): Date {
    return this.props.endsAt
  }

  public static validate(endsAt: Date): boolean {
    if (!endsAt || 
      dayjs(endsAt).isBefore(new Date()) ||
      dayjs(endsAt).isSame(new Date())
    ) {
      return false
    }

    return true
  }

  static create(endsAt: Date): Either<InvalidDateError, EndsAt> {
    if (!this.validate(endsAt)) {
      return left(new InvalidDateError())
    }

    return right(new EndsAt({ endsAt }))
  }
}