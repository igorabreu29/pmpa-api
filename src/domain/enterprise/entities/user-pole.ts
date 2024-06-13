import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface UserPoleProps {
  userId: UniqueEntityId
  poleId: UniqueEntityId
}

export class UserPole extends Entity<UserPoleProps> {
  get userId() {
    return this.props.userId
  }

  get poleId() {
    return this.props.poleId
  }
   
  static create(props: UserPoleProps, id?: UniqueEntityId) {
    return new UserPole(props, id)
  }
}