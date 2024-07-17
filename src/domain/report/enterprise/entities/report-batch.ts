import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";
import { TypeAction } from "./report.ts";

interface ReportBatchProps {
  reporterId: UniqueEntityId
  title: string
  content: string
  ip: string
  fileName: string
  fileLink: string
  createdAt: Date
  action: TypeAction
} 

export class ReportBatch extends Entity<ReportBatchProps> {
  get reporterId() {
    return this.props.reporterId
  }

  get title() {
    return this.props.title
  }

  get content() {
    return this.props.content
  }

  get ip() {
    return this.props.ip
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

  static create(
    props: Optional<ReportBatchProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    return new ReportBatch({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)
  }
}