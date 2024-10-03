import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ChangeStudentStatusEvent } from "@/domain/boletim/enterprise/events/change-student-status-event.ts";
import type { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnStudentActivated implements EventHandler {
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
      this.sendActiveStudentReport.bind(this),
      ChangeStudentStatusEvent.name
    )
  }

  private async sendActiveStudentReport({ studentCourse, reason, reporterId, reporterIp, ocurredAt }: ChangeStudentStatusEvent) {
    const [reporter, student, course] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(studentCourse.studentId.toValue()),
      this.coursesRepository.findById(studentCourse.courseId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    if (course && reporter) {
      await this.sendReport.execute({
        title: 'Estudante Ativado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (reporter.role)
          Estudante: ${student?.username.value}
          Curso: ${course.name.value}
          Data: ${formattedDate}
          Razão: ${reason}
          ${reporter?.username.value} ativou o aluno: ${student?.username.value}
        `,
        ip: reporterIp,
        courseId: course.id.toValue(),
        reporterId: reporterId,
        action: 'status'
      })
    }
  }
}