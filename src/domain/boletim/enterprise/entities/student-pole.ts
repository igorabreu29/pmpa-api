import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

interface StudentPoleProps {
  studentId: UniqueEntityId
  poleId: UniqueEntityId
  createdAt: Date
}

export class StudentPole extends Entity<StudentPoleProps> {
  get studentId() {
    return this.props.studentId
  }

  get poleId() {
    return this.props.poleId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<StudentPoleProps, 'createdAt'>, id?: UniqueEntityId) {
    return new StudentPole({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)
  }
}