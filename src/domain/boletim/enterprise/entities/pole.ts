import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Name } from "./value-objects/name.ts";
import { Either, right } from "@/core/either.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";

interface PoleProps {
  name: Name
}

export class Pole extends Entity<PoleProps> {
  get name() {
    return this.props.name
  }

  static create(
    props: PoleProps,
    id?: UniqueEntityId
  ): Either<InvalidNameError, Pole> {
    const pole = new Pole(props, id)

    return right(pole)
  }
}