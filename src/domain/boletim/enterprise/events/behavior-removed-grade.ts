import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Behavior } from "../entities/behavior.ts";

interface BehaviorRemovedGradeEventProps {
  behavior: Behavior
  reporterId: string
  reporterIp: string
}

export class BehaviorRemovedGradeEvent implements DomainEvent {
  public ocurredAt: Date
  public behavior: Behavior

  public reporterId: string
  public reporterIp: string

  public constructor({
    behavior,
    reporterId,
    reporterIp
  }: BehaviorRemovedGradeEventProps) {
    this.behavior = behavior
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.behavior.id
  }
}