import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Assessment } from "../entities/assessment.ts";

interface AssessmentRemovedGradeEventProps {
  assessment: Assessment
  reporterId: string
  reporterIp: string
}

export class AssessmentRemovedGradeEvent implements DomainEvent {
  public ocurredAt: Date
  public assessment: Assessment

  public reporterId: string
  public reporterIp: string

  public constructor({
    assessment,
    reporterId,
    reporterIp
  }: AssessmentRemovedGradeEventProps) {
    this.assessment = assessment
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.assessment.id
  }
}