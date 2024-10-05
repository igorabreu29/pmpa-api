import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import type { ManagerCourse } from "../entities/manager-course.ts";

interface ManagerCourseDeletedEventProps {
  managerCourse: ManagerCourse
  reporterId: string
  reporterIp: string
}

export class ManagerCourseDeletedEvent implements DomainEvent {
  public ocurredAt: Date;
  public managerCourse: ManagerCourse
  public reporterId: string
  public reporterIp: string

  public constructor({
    managerCourse,
    reporterId,
    reporterIp,
  }: ManagerCourseDeletedEventProps) {
    this.managerCourse = managerCourse
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.managerCourse.id
  }
}