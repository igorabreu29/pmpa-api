import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { BehaviorEvent } from "@/domain/boletim/enterprise/events/behavior-event.ts";
import { BehaviorDeletedEvent } from "@/domain/boletim/enterprise/events/behavior-deleted-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnBehaviorDeleted implements EventHandler {
  constructor (
    private studentsRepository: StudentsRepository,
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteBehaviorReport.bind(this),
      BehaviorDeletedEvent.name
    )
  }

  private async sendDeleteBehaviorReport({ behavior, reporterId, reporterIp, ocurredAt }: BehaviorDeletedEvent) {
    const [course, reporter, student] = await Promise.all([
      this.coursesRepository.findById(behavior.courseId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(behavior.studentId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - hh:mm:ss')

    if (course && reporter && student) {
      await this.sendReport.execute({
        title: 'Notas de comportamento deletadas',
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Data: ${formattedDate}
          ${reporter.username.value} deletou notas de comportamento do aluno: ${student.username.value}
        `,
        courseId: behavior.courseId.toValue(),
        ip: reporterIp,
        reporterId,
        action: 'remove'
      })
    }
  }
}