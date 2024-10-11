import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { BehaviorEvent } from "@/domain/boletim/enterprise/events/behavior-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnBehaviorCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewBehaviorReport.bind(this),
      BehaviorEvent.name
    )
  }

  private async sendNewBehaviorReport({ behavior, courseName, studentName, reporterId, reporterIp, ocurredAt }: BehaviorEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')


    if (reporter) {
      await this.sendReport.execute({
        title: 'Notas de comportamento adicionadas',
        content: `
          IP: ${reporterIp}
          Curso: ${courseName}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${studentName}
          Data: ${formattedDate}

          ${reporter.username.value} adicionou notas de comportamento para o aluno: ${studentName}
          JANEIRO: ${behavior.january || ''}
          FEVEREIRO: ${behavior.february || ''}
          MARÇO: ${behavior.march || ''}
          ABRIL: ${behavior.april || ''}
          MAIO: ${behavior.may || ''}
          JUN: ${behavior.jun || ''}
          JULHO: ${behavior.july || ''}
          AGOSTO: ${behavior.august || ''}
          SETEMBRO: ${behavior.september || ''}
          OUTUBRO: ${behavior.october || ''}
          NOVEMBRO: ${behavior.november || ''}
          DEZEMBRO: ${behavior.december || ''}
        `,
        ip: reporterIp,
        courseId: behavior.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}