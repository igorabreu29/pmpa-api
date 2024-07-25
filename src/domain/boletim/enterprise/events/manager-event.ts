import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Manager } from "../entities/manager.ts";

interface ManagerEventProps {
  manager: Manager
  reporterId: string
  reporterIp: string
  courseId?: string
}

export class ManagerEvent implements DomainEvent {
  public ocurredAt: Date
  public manager: Manager
  public reporterId: string
  public reporterIp: string
  public courseId?: string

  public constructor({
    manager,
    reporterId,
    reporterIp,
    courseId
  }: ManagerEventProps) {
    this.manager = manager
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.courseId = courseId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.manager.id
  }
}