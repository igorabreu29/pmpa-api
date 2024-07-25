import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { ManagerEvent } from "@/domain/boletim/enterprise/events/manager-event.ts";

export class OnManagerCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendUpdateManagerReport.bind(this),
      ManagerEvent.name
    )
  }

  private async sendUpdateManagerReport({ manager, reporterId, reporterIp, ocurredAt }: ManagerEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })

    if (reporter) {
      await this.sendReport.execute({
        title: 'Estudante criado',
        content: `
          IP: ${reporterIp} \n
          Remetente: ${reporter.username.value} \n
          Gerente: ${manager.username.value} \n
          Data: ${ocurredAt}
          ${reporter.username.value} atualizou o gerente: ${manager.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}