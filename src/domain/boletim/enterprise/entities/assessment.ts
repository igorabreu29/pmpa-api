import { AggregateRoot } from "@/core/entities/aggregate-root.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { AssessmentEvent } from "../events/assessment-event.ts";

interface AssessmentProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  poleId: UniqueEntityId
  disciplineId: UniqueEntityId
  vf: number
  avi: number | null
  avii: number | null
  vfe: number | null
  userIP: string
}

export class Assessment extends AggregateRoot<AssessmentProps> {
  get studentId() {
    return this.props.studentId
  }

  get courseId() {
    return this.props.courseId
  }

  get poleId() {
    return this.props.poleId
  }

  get disciplineId() {
    return this.props.disciplineId
  }
  
  get vf() {
    return this.props.vf
  }
  set vf(value) {
    this.props.vf = value
  }

  get avi() {
    if (
      this.props.avi && (
        this.props.avi > 10 || this.props.avi < 0
      )
    ) return null

    return this.props.avi
  }
  set avi(value) {
    this.props.avi = value
  }

  get avii() {
    if (!this.props.avi) return null
    if (this.props.avii && (
      this.props.avii > 10 || this.props.avii < 0
    )) return null

    return this.props.avii
  }
  set avii(value) {
    this.props.avii = value
  }

  get vfe() {
    if (this.props.vfe && (
      this.props.vfe > 10 || this.props.vfe < 0
    )) return null

    return this.props.vfe
  }
  set vfe(value) {
    this.props.vfe = value
  }

  get userIP() {
    return this.props.userIP
  }

  static create(
    props: Optional<AssessmentProps, 'avi' | 'avii' | 'vfe'>,
    id?: UniqueEntityId) {

    const assessment = new Assessment({
      avi: null,
      avii: null,
      vfe: null,
      ...props
    }, id)
    
    const isNewAssessment = !id
    if (isNewAssessment) {
      assessment.addDomainEvent(new AssessmentEvent(assessment, assessment.userIP))
    }

    return assessment
  }
}