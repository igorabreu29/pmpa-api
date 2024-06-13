import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface DisciplineProps {
  name: string
}

export class Discipline extends Entity<DisciplineProps> {
  get name() {
    return this.props.name
  }

  static create(props: DisciplineProps, id?: UniqueEntityId) {
    return new Discipline(props, id)
  }
}