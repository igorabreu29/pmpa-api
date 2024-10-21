import { Entity } from "@/core/entities/entity.ts"
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import type { AssessmentWithModule } from "../../app/utils/verify-formula.ts"

type Status = | 'approved' 
  | 'disapproved' 
  | 'approved second season' 
  | 'disapproved second season'
  | 'second season'

type Concept = 'excellent' 
  | 'very good' 
  | 'good' 
  | 'regular' 
  | 'insufficient' 
  | 'no income'

interface Behavior {
  behaviorAverage: number
  status: 'approved' | 'disapproved'
  behaviorsCount: number
}


interface ClassificationProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  poleId: UniqueEntityId
  
  studentBirthday: Date

  average: number
  status: Status
  concept: Concept

  isPeriod: boolean
  hasBehavior: boolean

  assessments: AssessmentWithModule[]
  assessmentsCount: number

  behavior: Behavior[]
}

export class Classification extends Entity<ClassificationProps> {
  get studentId() {
    return this.props.studentId
  }

  get courseId() {
    return this.props.courseId
  }

  get poleId() {
    return this.props.poleId
  }

  get studentBirthday() {
    return this.props.studentBirthday
  }

  get average() {
    return this.props.average
  }

  get status() {
    return this.props.status
  }

  get concept() {
    return this.props.concept
  }

  get isPeriod() {
    return this.props.isPeriod
  }

  get hasBehavior() {
    return this.props.hasBehavior
  }

  get assessments() {
    return this.props.assessments
  }

  get assessmentsCount() {
    return this.props.assessmentsCount
  }

  get behavior() {
    return this.props.behavior
  }

  static create(props: ClassificationProps, id?: UniqueEntityId) {
    return new Classification(props, id)
  }
}