import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { AssessmentEvent } from "@/domain/boletim/enterprise/events/assessment-event.ts";

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

    if (reporter) {
      await this.sendReport.execute({
        title: 'Notas adicionadas',
        content: `
          IP: ${reporterIp}
          Course: ${courseName}
          Disciplina: ${disciplineName}
          Remetente: ${reporter.username.value}
          Estudante: ${studentName}
          Data: ${ocurredAt}
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