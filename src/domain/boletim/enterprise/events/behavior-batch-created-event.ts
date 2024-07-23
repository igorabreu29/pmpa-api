import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { BehaviorBatch } from "../entities/behavior-batch.ts";

interface BehaviorBatchCreatedEventProps {
  behaviorBatch: BehaviorBatch,
  reporterIp: string
}

export class BehaviorBatchCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public behaviorBatch: BehaviorBatch
  public reporterIp: string

  public constructor({
    behaviorBatch,
    reporterIp
  }: BehaviorBatchCreatedEventProps) {
    this.behaviorBatch = behaviorBatch
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.behaviorBatch.id
  }
}