import { Either, right } from "@/core/either.ts";
import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";

export interface ReporterProps {
  username: Name
}

export class Reporter extends Entity<ReporterProps> {
  get username() {
    return this.props.username
  }

  static create(
    props: ReporterProps,
    id?: UniqueEntityId
  ): Either<
    | InvalidNameError,
    Reporter
  > {
    const reporter = new Reporter(props, id)
    return right(reporter)
  }
}