import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

export type Active = 'enabled' | 'disabled'

export type Formule = 'module' | 'period'

export type CourseType = 'CFP' | 'CAS' | 'CHO' | 'CFO'

interface CourseProps { 
  formule: Formule
  name: string
  active: Active
  imageUrl: string
  startAt: Date
  endsAt: Date
  type: CourseType
  modules: number | null
  periods: number | null
}

export class Course extends Entity<CourseProps> {
  get formule() {
    return this.props.formule
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

  static create(props: Optional<CourseProps, 'startAt'>, id?: UniqueEntityId) {
    return new Course({
      startAt: new Date(),
      ...props
    }, id)
  }
}