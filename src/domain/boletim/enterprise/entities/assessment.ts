import { AggregateRoot } from "@/core/entities/aggregate-root.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { Either, left, right } from "@/core/either.ts";
import { ConflictError } from "../../app/use-cases/errors/conflict-error.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";

export type Status = 'approved' | 'disapproved' | 'approved second season' | 'second season'

interface AssessmentProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  disciplineId: UniqueEntityId
  vf: number | null
  avi: number | null
  avii: number | null
  vfe: number | null

  average: number
  status: Status
  isRecovering: boolean
}

export interface AssessmentStatus {
  average: number
  isRecovering: boolean
}

interface GenerateAssessmentAverageProps {
  vf: number
  avi: number
  avii: number
  vfe: number | null
}

export class Assessment extends AggregateRoot<AssessmentProps> {
  get studentId() {
    return this.props.studentId
  }

  get courseId() {
    return this.props.courseId
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
    return this.props.avi
  }
  set avi(value) {
    this.props.avi = value
  }

  get avii() {
    return this.props.avii
  }
  set avii(value) {
    this.props.avii = value
  }

  get vfe() {
    return this.props.vfe
  }
  set vfe(value) {
    this.props.vfe = value
  }

  get average() {
    return this.props.average
  }
  set average(value) {
    this.props.average = value
  }
  
  get status() {
    return this.props.status
  }
  set status(value) {
    this.props.status = value
  }

  get isRecovering() {
    return this.props.isRecovering
  }
  set isRecovering(value) {
    this.props.isRecovering = value
  }

  static getStudentAssessmentAverageStatus({ average, isRecovering }: AssessmentStatus): { status: Status } {
    if (isRecovering) return average >= 10 ? { status: 'approved second season' } : { status: 'disapproved' }
  
    return average >= 7 && average <= 10 ? { status: 'approved' } : { status: 'second season' }
  }

  static generateAverageAndStatus({ vf, avi, avii, vfe }: GenerateAssessmentAverageProps) {
    const assessments = [vf, avi, avii].filter(grade => grade >= 0)
    const average = assessments.reduce((previousNote, currentNote) => previousNote + currentNote, 0) / assessments.length
  
    if (vfe) {
      const assessmentAverageWithVfe = (average + vfe + 10) / 4 
      const sumBetweenAssessmentAverageAndVfe = average + vfe
  
      const { status } = Assessment.getStudentAssessmentAverageStatus({ average: sumBetweenAssessmentAverageAndVfe, isRecovering: true })
  
      return {
        vf,
        avi: avi >= 0 ? avi : null,
        avii: avii >= 0 ? avii : null,
        vfe,
        average: assessmentAverageWithVfe,
        status,
        isRecovering: true
      }
    }
  
    const { status } = Assessment.getStudentAssessmentAverageStatus({ average, isRecovering: false })
  
    return {
      vf,
      avi: avi >= 0 ? avi : null,
      avii: avii >= 0 ? avii : null,
      vfe: null,
      average,
      status,
      isRecovering: false
    }
  }

  public addDomainAssessmentEvent(domainEvent: DomainEvent): void {
    this.addDomainEvent(domainEvent)
  }

  static create(
    props: Optional<AssessmentProps, 'avi' | 'avii' | 'vfe' | 'average' | 'status' | 'isRecovering'>,
    id?: UniqueEntityId
  ): Either<ConflictError, Assessment> {
    if (!props.vf && props.avi) return left(new ConflictError('Está faltando a VF.'))

    if (props.avi && (
        props.avi > 10 || props.avi < 0
      )
    ) return left(new ConflictError('A notas não podem ser maiores que 10 ou menores que 0'))

    if (!props.avi && props.avii) return left(new ConflictError('Está faltado a AVI'))

    if (props.avi && props.avii && (
        props.avii > 10 || props.avii < 0
      )
    ) return left(new ConflictError('A notas não podem ser maiores que 10 ou menores que 0'))

    if (props.vfe && (
        props.vfe > 10 || props.vfe < 0
      )
    ) return left(new ConflictError('A notas não podem ser maiores que 10 ou menores que 0'))

    const averageAndStatus = Assessment.generateAverageAndStatus({
      vf: !props.vf ? -1 : props.vf, 
      avi: !props.avi ? -1 : props.avi,
      avii: !props.avii ? -1 : props.avii, 
      vfe: !props.vfe ? null : props.vfe
    })

    const assessment = new Assessment({
      ...props,
      avi: props.avi ?? null,
      avii: props.avii ?? null,
      vfe: props.vfe ?? null,
      isRecovering: averageAndStatus.isRecovering,
      average: averageAndStatus.average,
      status: averageAndStatus.status 
    }, id)
    
    return right(assessment)
  }
}