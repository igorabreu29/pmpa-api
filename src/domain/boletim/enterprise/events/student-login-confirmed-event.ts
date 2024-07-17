import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Student } from "../entities/student.ts";

export interface StudentLoginConfirmedEventProps {
  student: Student
  studentIp: string
}

export class StudentLoginConfirmedEvent implements DomainEvent {
  public ocurredAt: Date
  public student: Student
  public studentIp: string

  public constructor({ student, studentIp }: StudentLoginConfirmedEventProps) {
    this.student = student
    this.studentIp = studentIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.student.id
  }
}