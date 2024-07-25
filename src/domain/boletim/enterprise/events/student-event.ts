import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Student } from "../entities/student.ts";

interface StudentEventProps {
  student: Student
  reporterId: string
  reporterIp: string
  courseId?: string
}

export class StudentEvent implements DomainEvent {
  public ocurredAt: Date;
  public student: Student
  public reporterId: string
  public reporterIp: string
  public courseId?: string

  public constructor({
    student,
    reporterId,
    reporterIp,
    courseId
  }: StudentEventProps) {
    this.student = student
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.courseId = courseId
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.student.id
  }
}