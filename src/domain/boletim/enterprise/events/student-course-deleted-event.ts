import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import type { StudentCourse } from "../entities/student-course.ts";

interface StudentCourseDeletedEventProps {
  studentCourse: StudentCourse
  reporterId: string
  reporterIp: string
}

export class StudentCourseDeletedEvent implements DomainEvent {
  public ocurredAt: Date;
  public studentCourse: StudentCourse
  public reporterId: string
  public reporterIp: string

  public constructor({
    studentCourse,
    reporterId,
    reporterIp,
  }: StudentCourseDeletedEventProps) {
    this.studentCourse = studentCourse
    this.reporterId = reporterId
    this.reporterIp = reporterIp
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.studentCourse.id
  }
}