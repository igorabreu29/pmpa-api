import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { StudentEvent } from "@/domain/boletim/enterprise/events/student-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnStudentCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewStudentReport.bind(this),
      StudentEvent.name
    )
  }

  private async sendNewStudentReport({ student, courseId, reporterId, reporterIp, ocurredAt }: StudentEvent) {
    const [reporter, course] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
      this.coursesRepository.findById(String(courseId))
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    if (reporter && course) {
      await this.sendReport.execute({
        title: 'Estudante criado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Curso: ${course.name.value}
          Data: ${formattedDate}
          ${reporter.username.value} adicionou o aluno: ${student.username.value}
        `,
        ip: reporterIp,
        courseId,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}