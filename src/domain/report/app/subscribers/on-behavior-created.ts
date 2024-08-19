import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { BehaviorEvent } from "@/domain/boletim/enterprise/events/behavior-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";

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

  private async sendNewBehaviorReport({ courseName, studentName, reporterId, reporterIp, ocurredAt }: BehaviorEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })

    if (reporter) {
      await this.sendReport.execute({
        title: 'Notas de comportamento adicionadas',
        content: `
          IP: ${reporterIp} \n
          Curso: ${courseName} \n
          Remetente: ${reporter.username.value} \n
          Estudante: ${studentName} \n
          Data: ${ocurredAt} \n
          ${reporter.username.value} adicionou notas de comportamento para o aluno: ${studentName}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}