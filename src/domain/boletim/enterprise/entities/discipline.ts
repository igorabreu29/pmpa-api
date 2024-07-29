import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { Name } from "./value-objects/name.ts";
import { right, type Either } from "@/core/either.ts";
import type { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";

interface DisciplineProps {
  name: Name
}

export class Discipline extends Entity<DisciplineProps> {
  get name() {
    return this.props.name
  }

  static create(
    props: DisciplineProps, 
    id?: UniqueEntityId): Either<InvalidNameError, Discipline> {
    const discipline = new Discipline(props, id)
    return right(discipline)
  }
}