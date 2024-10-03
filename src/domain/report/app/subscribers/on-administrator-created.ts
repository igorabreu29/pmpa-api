import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { AdministratorEvent } from "@/domain/boletim/enterprise/events/administrator-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

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
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    if (reporter) {
      await this.sendReport.execute({
        title: 'Administrador criado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value}
          Administrador: ${administrator.username.value}
          Data: ${formattedDate}
          ${reporter.username.value} adicionou o administrador: ${administrator.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}