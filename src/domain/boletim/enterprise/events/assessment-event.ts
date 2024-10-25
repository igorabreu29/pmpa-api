import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Assessment } from "../entities/assessment.ts";

interface AssessmentEventProps {
  assessment: Assessment
  courseName: string
  disciplineName: string
  studentName: string
  reporterId: string
  reporterIp: string
}

export class AssessmentEvent implements DomainEvent {
  public ocurredAt: Date
  public assessment: Assessment
  
  public courseName: string
  public disciplineName: string
  public studentName: string

  public reporterId: string
  public reporterIp: string

  public constructor({
    assessment,
    courseName,
    disciplineName,
    studentName,
    reporterId,
    reporterIp
  }: AssessmentEventProps) {
    this.assessment = assessment
    this.courseName = courseName
    this.disciplineName = disciplineName
    this.studentName = studentName
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.assessment.id
  }
}