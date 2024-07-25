import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Administrator } from "../entities/administrator.ts";

interface AdministratorEventProps {
  administrator: Administrator
  reporterId: string
  reporterIp: string
}

export class AdministratorEvent implements DomainEvent {
  public ocurredAt: Date
  public administrator: Administrator
  public reporterId: string
  public reporterIp: string

  public constructor({
    administrator,
    reporterId,
    reporterIp
  }: AdministratorEventProps) {
    this.administrator = administrator
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.administrator.id
  }
}