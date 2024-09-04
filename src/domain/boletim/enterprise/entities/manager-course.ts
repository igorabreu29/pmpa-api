import { AggregateRoot } from "@/core/entities/aggregate-root.ts";
import { Entity } from "@/core/entities/entity.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { DomainEvent } from "@/core/events/domain-event.ts";
import { Optional } from "@/core/types/optional.ts";

export interface ManagerCourseProps {
  managerId: UniqueEntityId
  courseId: UniqueEntityId
  isActive: boolean
  createdAt: Date
}

export class ManagerCourse extends AggregateRoot<ManagerCourseProps> {
  get managerId() {
    return this.props.managerId
  }

  get courseId() {
    return this.props.courseId
  }

  get isActive() {
    return this.props.isActive
  }
  set isActive(value) {
    this.props.isActive = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  public addDomainManagerCourseEvent(domainEvent: DomainEvent): void {
    this.addDomainEvent(domainEvent)
  }

  static create(props: Optional<ManagerCourseProps, 'createdAt' | 'isActive'>, id?: UniqueEntityId) {
    return new ManagerCourse({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      isActive: props.isActive ?? true
    }, id)
  }
}