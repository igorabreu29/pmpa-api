import { UniqueEntityId } from "./unique-entity-id.ts";

export class Entity<Props> {
  private _id: UniqueEntityId
  protected props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityId) {
    this._id = id ?? new UniqueEntityId()
    this.props = props
  }

  public equals(entity: Entity<any>) {
    if (entity === this) return true
    if (entity.id === this._id) return true
    return false
  }
}