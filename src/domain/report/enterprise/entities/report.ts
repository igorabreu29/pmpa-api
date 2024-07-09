import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Optional } from "@/core/types/optional.ts";

interface ReportProps {
  userId: string
  title: string
  content: string
  IP: string
  createdAt: Date
} 

export class Report extends Entity<ReportProps> {
  get title() {
    return this.props.title
  }

  get content() {
    return this.props.content
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