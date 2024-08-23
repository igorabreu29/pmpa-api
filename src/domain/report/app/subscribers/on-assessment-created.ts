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
          <ul>
            <li>IP: ${reporterIp}</li>
            <li>Course: ${courseName}</li>
            <li>Disciplina: ${disciplineName}</li>
            <li>Remetente: ${reporter.username.value}</li>
            <li>Estudante: ${studentName}</li>
            <li>Data: ${ocurredAt}</li>
            <li>${reporter.username.value} adicionou notas para o aluno: ${studentName}</li>
          </ul>
        `,
        ip: reporterIp,
        courseId: assessment.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}