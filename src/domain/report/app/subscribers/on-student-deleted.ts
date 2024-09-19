import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { StudentEvent } from "@/domain/boletim/enterprise/events/student-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";

export class OnStudentDeleted implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteStudentReport.bind(this),
      StudentEvent.name
    )
  }

  private async sendDeleteStudentReport({ student, reporterId, reporterIp, ocurredAt }: StudentEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })

    if (reporter) {
      await this.sendReport.execute({
        title: 'Estudante deletado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value}
          Estudante: ${student.username.value}
          Data: ${ocurredAt}
          ${reporter.username.value} deletou o aluno: ${student.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}