import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { BehaviorEvent } from "@/domain/boletim/enterprise/events/behavior-event.ts";
import { BehaviorUpdatedEvent } from "@/domain/boletim/enterprise/events/behavior-updated-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnBehaviorUpdated implements EventHandler {
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
      this.sendUpdateBehaviorReport.bind(this),
      BehaviorUpdatedEvent.name
    )
  }

  private async sendUpdateBehaviorReport({ previousBehavior, behavior, reporterId, reporterIp, ocurredAt }: BehaviorUpdatedEvent) {
    const [course, reporter, student] = await Promise.all([
      this.coursesRepository.findById(behavior.courseId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(behavior.studentId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    const januaryWasUpdated = previousBehavior.january !== behavior.january
    const februaryWasUpdated = previousBehavior.february !== behavior.february
    const marchWasUpdated = previousBehavior.march !== behavior.march
    const aprilWasUpdated = previousBehavior.april !== behavior.april
    const mayWasUpdated = previousBehavior.may !== behavior.may
    const junWasUpdated = previousBehavior.jun !== behavior.jun
    const julyWasUpdated = previousBehavior.july !== behavior.july
    const augustWasUpdated = previousBehavior.august !== behavior.august
    const septemberWasUpdated = previousBehavior.september !== behavior.september
    const octoberWasUpdated = previousBehavior.october !== behavior.october
    const novemberWasUpdated = previousBehavior.november !== behavior.november
    const decemberWasUpdated = previousBehavior.december !== behavior.december

    if (course && reporter && student) {
      await this.sendReport.execute({
        title: 'Notas de comportamento atualizadas',
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Data: ${formattedDate}
          
          ${reporter.username.value} atualizou notas de comportamento do aluno: ${student.username.value}
          JANEIRO: ${januaryWasUpdated ? `${previousBehavior.january} para ${behavior.january}` : behavior.january ?? ''}
          FEVEREIRO: ${februaryWasUpdated ? `${previousBehavior.february} para ${behavior.february}` : behavior.february ?? ''}
          MARÇO: ${marchWasUpdated ? `${previousBehavior.march} para ${behavior.march}` : behavior.march ?? ''}
          ABRIL: ${aprilWasUpdated ? `${previousBehavior.april} para ${behavior.april}` : behavior.april ?? ''}
          MAIO: ${mayWasUpdated ? `${previousBehavior.may} para ${behavior.may}` : behavior.may ?? ''}
          JUN: ${junWasUpdated ? `${previousBehavior.jun} para ${behavior.jun}` : behavior.jun ?? ''}
          JULHO: ${julyWasUpdated ? `${previousBehavior.july} para ${behavior.july}` : behavior.july ?? ''}
          AGOSTO: ${augustWasUpdated ? `${previousBehavior.august} para ${behavior.april}` : behavior.august ?? ''}
          SETEMBRO: ${septemberWasUpdated ? `${previousBehavior.september} para ${behavior.september}` : behavior.september ?? ''}
          OUTUBRO: ${octoberWasUpdated ? `${previousBehavior.october} para ${behavior.october}` : behavior.october ?? ''}
          NOVEMBRO: ${novemberWasUpdated ? `${previousBehavior.november} para ${behavior.november}` : behavior.november ?? ''}
          DEZEMBRO: ${decemberWasUpdated ? `${previousBehavior.december} para ${behavior.december}` : behavior.december ?? ''}
        `,
        ip: reporterIp,
        courseId: behavior.courseId.toValue(),
        reporterId,
        action: 'update'
      })
    }
  }
}