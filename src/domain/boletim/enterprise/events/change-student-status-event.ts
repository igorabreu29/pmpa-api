import type { DomainEvent } from "@/core/events/domain-event.ts";
import type { StudentCourse } from "../entities/student-course.ts";
import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";

interface ChangeStudentStatusEventProps {
  studentCourse: StudentCourse
  reason: string
  reporterId: string
  reporterIp: string
}

export class ChangeStudentStatusEvent implements DomainEvent {
  public ocurredAt: Date
  public studentCourse: StudentCourse
  public reason: string

  public reporterId: string
  public reporterIp: string

  public constructor({
    studentCourse,
    reason,
    reporterId,
    reporterIp
  }: ChangeStudentStatusEventProps) {
    this.studentCourse = studentCourse
    this.reason =  reason
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.studentCourse.id
  }
}