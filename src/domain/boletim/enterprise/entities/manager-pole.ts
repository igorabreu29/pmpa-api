import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

export interface ManagerPoleProps {
  managerId: UniqueEntityId
  poleId: UniqueEntityId
  createdAt: Date
}

export class ManagerPole extends Entity<ManagerPoleProps> {
  get managerId() {
    return this.props.managerId
  }

  get poleId() {
    return this.props.poleId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<ManagerPoleProps, 'createdAt'>, id?: UniqueEntityId) {
    return new ManagerPole({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)
  }
}