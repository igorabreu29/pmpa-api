import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Assessment } from "../entities/assessment.ts";
import { AssessmentBatch } from "../entities/assessment-batch.ts";

export class AssessmentBatchCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public assessmentBatch: AssessmentBatch
  public userIP: string

  public constructor(assessmentBatch: AssessmentBatch, userIP: string) {
    this.assessmentBatch = assessmentBatch
    this.userIP = userIP
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.assessmentBatch.id
  }
}