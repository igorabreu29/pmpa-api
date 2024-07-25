import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { AdministratorEvent } from "@/domain/boletim/enterprise/events/administrator-event.ts";

export class OnAdministratorCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAdministratorReport.bind(this),
      AdministratorEvent.name
    )
  }

  private async sendNewAdministratorReport({ administrator, reporterId, reporterIp, ocurredAt }: AdministratorEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })

    if (reporter) {
      await this.sendReport.execute({
        title: 'Administrador criado',
        content: `
          IP: ${reporterIp} \n
          Remetente: ${reporter.username.value} \n
          Administrador: ${administrator.username.value} \n
          Data: ${ocurredAt}
          ${reporter.username.value} adicionou o administrador: ${administrator.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}