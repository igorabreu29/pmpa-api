import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { StudentEvent } from "@/domain/boletim/enterprise/events/student-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";

export class OnStudentUpdated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendUpdateStudentReport.bind(this),
      StudentEvent.name
    )
  }

  private async sendUpdateStudentReport({ student, reporterId, courseId, reporterIp, ocurredAt }: StudentEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })

    if (reporter) {
      await this.sendReport.execute({
        title: 'Estudante atulizado',
        content: `
          IP: ${reporterIp} \n
          Remetente: ${reporter.username.value} \n
          Estudante: ${student.username.value} \n
          Data: ${ocurredAt}
          ${reporter.username.value} atualizou o aluno: ${student.username.value}
        `,
        ip: reporterIp,
        courseId,
        reporterId: reporter.id.toValue(),
        action: 'update'
      })
    }
  }
}