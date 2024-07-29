import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ValueObject } from "@/core/entities/value-object.ts";

interface CourseWithDisciplineProps {
  courseId: UniqueEntityId
  disciplineId: UniqueEntityId
  disciplineName: string
  module: number
}

export class CourseWithDiscipline extends ValueObject<CourseWithDisciplineProps> {
  get courseId() {
    return this.props.courseId
  }

  get disciplineId() {
    return this.props.disciplineId
  }

  get disciplineName() {
    return this.props.disciplineName
  }

  get module() {
    return this.props.module
  }

  static create(props: CourseWithDisciplineProps) {
    return new CourseWithDiscipline(props)
  }
}