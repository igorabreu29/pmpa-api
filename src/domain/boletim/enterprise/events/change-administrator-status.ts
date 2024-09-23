import type { DomainEvent } from "@/core/events/domain-event.ts";
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import type { Administrator } from "../entities/administrator.ts";

interface ChangeAdministratorStatusEventProps {
  administrator: Administrator
  reason: string
  reporterId: string
  reporterIp: string
}

export class ChangeAdministratorStatusEvent implements DomainEvent {
  public ocurredAt: Date
  public administrator: Administrator
  public reason: string

  public reporterId: string
  public reporterIp: string

  public constructor({
    administrator,
    reason,
    reporterId,
    reporterIp
  }: ChangeAdministratorStatusEventProps) {
    this.administrator = administrator
    this.reason =  reason
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.administrator.id
  }
}