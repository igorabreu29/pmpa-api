import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { ManagerEvent } from "@/domain/boletim/enterprise/events/manager-event.ts";

export class OnManagerDeleted implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteManagerReport.bind(this),
      ManagerEvent.name
    )
  }

  private async sendDeleteManagerReport({ manager, reporterId, reporterIp, ocurredAt }: ManagerEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })

    if (reporter) {
      await this.sendReport.execute({
        title: 'Gerente deletado',
        content: `
          IP: ${reporterIp} \n
          Remetente: ${reporter.username.value} \n
          Gerente: ${manager.username.value} \n
          Data: ${ocurredAt}
          ${reporter.username.value} deletou o gerente: ${manager.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}