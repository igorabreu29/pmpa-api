import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface AssessmentProps {
  studentId: UniqueEntityId
  courseId: UniqueEntityId
  poleId: UniqueEntityId
  disciplineId: UniqueEntityId
  vf: number
  avi?: number
  avii?: number
  vfe?: number | null
}

export class Assessment extends Entity<AssessmentProps> {
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

  static create(props: AssessmentProps, id?: UniqueEntityId) {
    return new Assessment({
      avi: 0,
      avii: 0,
      vfe: null,
      ...props
    }, id)
  }
}