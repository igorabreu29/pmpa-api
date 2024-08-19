import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

export type TypeAction  = 'add' | 'remove' | 'update' | 'login confirmed'

interface ReportProps {
  reporterId: string
  title: string
  content: string
  ip: string
  fileName?: string
  fileLink?: string
  createdAt: Date
  action: TypeAction
} 

export class Report extends Entity<ReportProps> {
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

  get action() {
    return this.props.action
  }
  
  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ReportProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    return new Report({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)
  }
}