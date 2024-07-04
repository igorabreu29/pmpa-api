import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CourseHistoricProps {
  courseId: UniqueEntityId
  className: string
  startDate: Date
  finishDate: Date | string
  speechs?: number
  internships?: number
  totalHours?: number
  divisionBoss?: string
  commander?: string
}

export class CourseHistoric extends Entity<CourseHistoricProps> {
  get courseId() {
    return this.props.courseId
  }

  get className() {
    return this.props.className
  }

  get startDate() {
    return this.props.startDate
  }

  get finishDate() {
    if (this.props.finishDate < this.props.startDate) {
      return 'Course has been finished'
    }
 
    return this.props.finishDate
  }

  get speechs() {
    return this.props.speechs
  }

  get internships() {
    return this.props.internships
  }

  get totalHours() {
    return this.props.totalHours
  }

  get divisionBoss() {
    return this.props.divisionBoss
  }

  get commander() {
    return this.props.commander
  }

  static create(props: CourseHistoricProps, id?: UniqueEntityId) {
    return new CourseHistoric(props, id)
  }
}