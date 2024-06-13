import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface BehaviorProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  poleId: UniqueEntityId
  january?: number | null
  february?: number | null
  march?: number | null
  april?: number | null
  may?: number | null
  jun?: number | null
  july?: number | null
  august?: number | null
  september?: number | null
  october?: number | null
  november?: number | null
  december?: number | null
  currentYear: number
}

export class Behavior extends Entity<BehaviorProps> {
  get studentId() {
    return this.props.studentId
  }

  get courseId() {
    return this.props.courseId
  }

  get poleId() {
    return this.props.poleId
  }

  get january() {
    return this.props.january
  }
  set january(value) {
    this.props.january = value
  }

  get february() {
    return this.props.february
  }
  set february(value) {
    this.props.february = value
  }

  get march() {
    return this.props.march
  }
  set march(value) {
    this.props.march = value
  }

  get april() {
    return this.props.april
  }
  set april(value) {
    this.props.april = value
  }

  get may() {
    return this.props.may
  }
  set may(value) {
    this.props.may = value
  }

  get jun() {
    return this.props.jun
  }
  set jun(value) {
    this.props.jun = value
  }

  get july() {
    return this.props.july
  }
  set july(value) {
    this.props.july = value
  }

  get august() {
    return this.props.august
  }
  set august(value) {
    this.props.august = value
  }

  get september() {
    return this.props.september
  }
  set september(value) {
    this.props.september = value
  }

  get october() {
    return this.props.october
  }
  set october(value) {
    this.props.october = value
  }

  get november() {
    return this.props.november
  }
  set november(value) {
    this.props.november = value
  }

  get december() {
    return this.props.december
  }
  set december(value) {
    this.props.december = value
  }

  get currentYear() {
    return this.props.currentYear
  }

  static create(props: BehaviorProps, id?: UniqueEntityId) {
    return new Behavior({
      ...props
    }, id)
  }
}