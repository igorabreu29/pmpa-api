import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Assessment } from "../entities/assessment.ts";

export class AssessmentEvent implements DomainEvent {
  public ocurredAt: Date;
  public assessment: Assessment
  public userIP: string

  public constructor(assessment: Assessment, userIP: string) {
    this.assessment = assessment
    this.userIP = userIP
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.assessment.id
  }
}