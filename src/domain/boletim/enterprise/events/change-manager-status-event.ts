import type { DomainEvent } from "@/core/events/domain-event.ts";
import type { ManagerCourse } from "../entities/manager-course.ts";
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface ChangeManagerStatusEventProps {
  managerCourse: ManagerCourse
  reason: string
  reporterId: string
  reporterIp: string
}

export class ChangeManagerStatusEvent implements DomainEvent {
  public ocurredAt: Date
  public managerCourse: ManagerCourse
  public reason: string

  public reporterId: string
  public reporterIp: string

  public constructor({
    managerCourse,
    reason,
    reporterId,
    reporterIp
  }: ChangeManagerStatusEventProps) {
    this.managerCourse = managerCourse
    this.reason =  reason
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.managerCourse.id
  }
}