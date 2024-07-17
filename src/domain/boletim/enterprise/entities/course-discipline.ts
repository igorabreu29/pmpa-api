import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CourseDisciplineProps {
  courseId: UniqueEntityId
  disciplineId: UniqueEntityId
  module: number
  expected: string
  hours: number
  weight: number
}

export class CourseDiscipline extends Entity<CourseDisciplineProps> {
  get courseId() {
    return this.props.courseId
  }

  get disciplineId() {
    return this.props.disciplineId
  }

  get module() {
    return this.props.module
  }

  get expected() {
    return this.props.expected
  }

  get hours() {
    return this.props.hours
  }

  get weight() {
    return this.props.weight
  }

  static create(props: CourseDisciplineProps, id?: UniqueEntityId) {
    return new CourseDiscipline(props, id)
  }
}