import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { AssessmentEvent } from "@/domain/boletim/enterprise/events/assessment-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnAssessmentCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAssessmentReport.bind(this),
      AssessmentEvent.name
    )
  }

  private async sendNewAssessmentReport({ assessment, courseName, disciplineName, studentName, reporterId, reporterIp, ocurredAt }: AssessmentEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    if (reporter) {
      await this.sendReport.execute({
        title: 'Notas adicionadas',
        content: `
          IP: ${reporterIp}
          Curso: ${courseName}
          Disciplina: ${disciplineName}
          Remetente: ${reporter.username.value} (reporter.role)
          Estudante: ${studentName}
          Data: ${formattedDate}
          ${reporter.username.value} atualizou notas do aluno: ${studentName}
        `,
        ip: reporterIp,
        courseId: assessment.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}