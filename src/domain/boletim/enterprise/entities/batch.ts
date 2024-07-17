import { AggregateRoot } from "@/core/entities/aggregate-root.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"

export interface BatchProps {
  courseId: UniqueEntityId
  userId: UniqueEntityId
  userIp: string
  fileName: string
  fileLink: string
}

export abstract class Batch<
  Props extends BatchProps
> extends AggregateRoot<Props> {
  get courseId() {
    return this.props.courseId
  }

  get userId() {
    return this.props.userId
  }

  get userIp() {
    return this.props.userIp
  }

  get fileName() {
    return this.props.fileName
  }

  get fileLink() {
    return this.props.fileLink
  }
}