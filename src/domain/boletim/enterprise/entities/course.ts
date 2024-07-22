import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { Name } from "./value-objects/name.ts";
import { EndsAt } from "./value-objects/ends-at.ts";
import { Either, right } from "@/core/either.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts";

export type Active = 'enabled' | 'disabled'

export type Formula = 'CGS' | 'CFP' | 'CAS' | 'CHO' | 'CFO'

interface CourseProps { 
  formula: Formula
  isPeriod: boolean
  name: Name
  active: Active
  imageUrl: string
  startAt: Date
  endsAt: EndsAt
  modules: number | null
  periods: number | null
}

export class Course extends Entity<CourseProps> {
  get formula() {
    return this.props.formula
  }

  get isPeriod() {
    return this.props.isPeriod
  }

  get name() {
    return this.props.name
  }

  get active() {
    return this.props.active
  }

  get imageUrl() {
    return this.props.imageUrl
  }

  get modules() {
    return this.props.modules
  }

  get periods() {
    return this.props.periods
  }

  get startAt() {
    return this.props.startAt
  }

  get endsAt() {
    return this.props.endsAt
  }

  static create(
    props: Optional<CourseProps, 'startAt' | 'isPeriod'>, 
    id?: UniqueEntityId
  ): Either<
    | InvalidNameError
    | InvalidDateError,
    Course
  > {
    const course = new Course({
      startAt: new Date(),
      isPeriod: false,
      ...props
    }, id)

    return right(course)
  }
}