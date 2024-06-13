import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { User } from "./user.ts";

interface PoleProps {
  name: string
}

export class Pole extends Entity<PoleProps> {
  get name() {
    return this.props.name
  }

  static create(props: PoleProps, id?: UniqueEntityId) {
    return new Pole(props, id)
  }
}