import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ChangeStudentStatusEvent } from "@/domain/boletim/enterprise/events/change-student-status-event.ts";
import type { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";

export class OnStudentDisabled implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private studentsRepository: StudentsRepository,
    private coursesRepository: CoursesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDisableStudentReport.bind(this),
      ChangeStudentStatusEvent.name
    )
  }

  private async sendDisableStudentReport({ studentCourse, reason, reporterId, reporterIp, ocurredAt }: ChangeStudentStatusEvent) {
    const [reporter, student, course] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(studentCourse.studentId.toValue()),
      this.coursesRepository.findById(studentCourse.courseId.toValue())
    ])

    if (course) {
      await this.sendReport.execute({
        title: 'Estudante desativado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter?.username.value}
          Estudante: ${student?.username.value}
          Curso: ${course.name.value}
          Data: ${ocurredAt}
          Razão: ${reason}
          ${reporter?.username.value} desativou o aluno: ${student?.username.value}
        `,
        ip: reporterIp,
        courseId: course.id.toValue(),
        reporterId: reporterId,
        action: 'status'
      })
    }
  }
}