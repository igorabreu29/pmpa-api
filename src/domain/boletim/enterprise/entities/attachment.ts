import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

interface AttachmentProps {
  courseId?: UniqueEntityId
  fileName: string
  fileLink: string
  createdAt: Date
}

export class Attachment extends Entity<AttachmentProps> {
  get courseId() {
    return this.props.courseId
  }

  get fileName() {
    return this.props.fileName
  }

  get fileLink() {
    return this.props.fileLink
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<AttachmentProps, 'createdAt'>, id?: UniqueEntityId) {
    return new Attachment({
      ...props,
      createdAt: props.createdAt ?? new Date()
    })
  }
}