import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { AssessmentBatch } from "../entities/assessment-batch.ts";

interface AssessmentBatchCreatedEventProps {
  assessmentBatch: AssessmentBatch,
  reporterIp: string
}

export class AssessmentBatchCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public assessmentBatch: AssessmentBatch
  public reporterIp: string

  public constructor({
    assessmentBatch,
    reporterIp
  }: AssessmentBatchCreatedEventProps) {
    this.assessmentBatch = assessmentBatch
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.assessmentBatch.id
  }
}