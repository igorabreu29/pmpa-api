import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Pole } from "./pole.ts";
import { User } from "./user.ts";
import { Discipline } from "./discipline.ts";

export type Active = 'enabled' | 'disabled'

export type Formule = 'module' | 'period'

interface CourseProps {
  formule: Formule
  name: string
  active: Active
  imageUrl: string
  modules: number | null
  periods: number | null

  // disciplines: Discipline[]
  users?: User[]
  poles?: Pole[]
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

  get users() {
    return this.props.users
  }

  get poles() {
    return this.props.poles
  }

  static create(props: CourseProps, id?: UniqueEntityId) {
    return new Course(props, id)
  }
}