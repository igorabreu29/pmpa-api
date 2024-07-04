import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CoursePoleProps {
  courseId: UniqueEntityId
  poleId: UniqueEntityId
  managerName: string | null
}

export class CoursePole extends Entity<CoursePoleProps> {
  get courseId() {
    return this.props.courseId
  }

  get poleId() {
    return this.props.poleId
  }

  get managerName() {
    return this.props.managerName
  }
  
  static create(props: CoursePoleProps, id?: UniqueEntityId) {
    return new CoursePole(props, id)
  }
}