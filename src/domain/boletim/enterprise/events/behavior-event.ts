import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Behavior } from "../entities/behavior.ts";

export interface BehaviorEventProps {
  behavior: Behavior
  courseName: string
  studentName: string

  reporterId: string
  reporterIp: string
}

export class BehaviorEvent implements DomainEvent {
  public ocurredAt: Date;
  public behavior: Behavior
  public courseName: string
  public studentName: string
  public reporterId: string
  public reporterIp: string

  public constructor({ behavior, courseName, studentName, reporterId, reporterIp }: BehaviorEventProps) {
    this.behavior = behavior
    this.courseName = courseName
    this.studentName = studentName
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.behavior.id
  }
}