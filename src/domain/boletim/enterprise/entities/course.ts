import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { Name } from "./value-objects/name.ts";
import { EndsAt } from "./value-objects/ends-at.ts";
import { Either, right } from "@/core/either.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts";

// export type Active = 'enabled' | 'disabled'

export type Formula = 'CGS' | 'CFP' | 'CAS' | 'CHO' | 'CFO' | 'CFO 2'
// export type CourseType = 'period' | 'module' | 'year'

export interface CourseProps { 
  formula: Formula
  isPeriod: boolean
  name: Name
  isActive: boolean
  imageUrl: string
  startAt: Date
  endsAt: EndsAt

  conceptType: number
  decimalPlaces: number
}

export class Course extends Entity<CourseProps> {
  get formula() {
    return this.props.formula
  }
  set formula(value) {
    this.props.formula = value
  }

  get isPeriod() {
    return this.props.isPeriod
  }
  set isPeriod(value) {
    this.props.isPeriod = value
  }

  get name() {
    return this.props.name
  }
  set name(value) {
    this.props.name = value
  }

  get isActive() {
    return this.props.isActive
  }
  set isActive(value) {
    this.props.isActive = value
  }

  get imageUrl() {
    return this.props.imageUrl
  }
  set imageUrl(value) {
    this.props.imageUrl = value
  }

  get startAt() {
    return this.props.startAt
  }
  set startAt(value) {
    this.props.startAt = value
  }

  get endsAt() {
    return this.props.endsAt
  }
  set endsAt(value) {
    this.props.endsAt = value
  }

  get decimalPlaces() {
    return this.props.decimalPlaces
  }
  set decimalPlaces(value) {
    this.props.decimalPlaces = value
  }

  get conceptType() {
    return this.props.conceptType
  }
  set conceptType(value) {
    this.props.conceptType = value
  }

  static create(
    props: Optional<CourseProps, 'startAt' | 'isPeriod' | 'isActive' | 'conceptType' | 'decimalPlaces'>, 
    id?: UniqueEntityId
  ): Either<
    | InvalidNameError
    | InvalidDateError,
    Course
  > {
    const course = new Course({
      ...props,
      startAt: props.startAt ?? new Date(),
      isPeriod: props.isPeriod ?? true,
      isActive: true,
      conceptType: 1,
      decimalPlaces: 3
    }, id)

    return right(course)
  }
}