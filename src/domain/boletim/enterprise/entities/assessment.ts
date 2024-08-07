import { AggregateRoot } from "@/core/entities/aggregate-root.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { Either, left, right } from "@/core/either.ts";
import { ConflictError } from "../../app/use-cases/errors/conflict-error.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";

interface AssessmentProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  disciplineId: UniqueEntityId
  vf: number | null
  avi: number | null
  avii: number | null
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

  public addDomainAssessmentEvent(domainEvent: DomainEvent): void {
    this.addDomainEvent(domainEvent)
  }

  static create(
    props: Optional<AssessmentProps, 'avi' | 'avii' | 'vfe'>,
    id?: UniqueEntityId
  ): Either<ConflictError, Assessment> {
    if (!props.vf) return left(new ConflictError('VF is missing'))

    if (props.avi && (
        props.avi > 10 || props.avi < 0
      )
    ) return left(new ConflictError('Invalid size number'))

    if (!props.avi && props.avii) return left(new ConflictError('Invalid expected'))

    if (props.avi && props.avii && (
        props.avii > 10 || props.avii < 0
      )
    ) return left(new ConflictError('Invalid size number'))

    if (props.vfe && (
        props.vfe > 10 || props.vfe < 0
      )
    ) return left(new ConflictError('Invalid size number'))

    const assessment = new Assessment({
      avi: props.avi ?? null,
      avii: props.avii ?? null,
      vfe: props.vfe ?? null,
      ...props
    }, id)
    
    return right(assessment)
  }
}