import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface CriterionProps {
  name: string
}

export class Criterion extends Entity<CriterionProps> {
  get name() {
    return this.props.name
  }

  static create(props: CriterionProps, id?: UniqueEntityId) {
    return new Criterion(props)
  }
}