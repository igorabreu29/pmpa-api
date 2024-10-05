import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import 'dayjs/locale/pt-br.js';
import type { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentCourseDeletedEvent } from "@/domain/boletim/enterprise/events/student-course-deleted-event.ts";
import type { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnStudentCourseDeleted implements EventHandler {
  constructor (
    private coursesRepository: CoursesRepository,
    private studentRepository: StudentsRepository,
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteStudentCourseReport.bind(this),
      StudentCourseDeletedEvent.name
    )
  }

  private async sendDeleteStudentCourseReport({ studentCourse, reporterId, reporterIp, ocurredAt }: StudentCourseDeletedEvent) {
    const [course, student, reporter] = await Promise.all([
      this.coursesRepository.findById(studentCourse.courseId.toValue()),
      this.studentRepository.findById(studentCourse.studentId.toValue()),
      this.reportersRepository.findById({ id: reporterId })
    ])
    
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    if (course && student && reporter) {
      await this.sendReport.execute({
        title: 'Estudante deletado do curso',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Curso: ${course.name.value}
          Data: ${formattedDate}
          ${reporter.username.value} deletou o estudante: ${student.username.value} do curso: ${course.name.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}