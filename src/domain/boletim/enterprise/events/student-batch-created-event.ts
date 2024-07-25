import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { StudentBatch } from "../entities/student-batch.ts";

interface StudentBatchCreatedEventProps {
  studentBatch: StudentBatch
  reporterIp: string
}

export class StudentBatchCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public studentBatch: StudentBatch
  public reporterIp: string

  public constructor({
    studentBatch,
    reporterIp
  }: StudentBatchCreatedEventProps) {
    this.studentBatch = studentBatch
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.studentBatch.id
  }
}