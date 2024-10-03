import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { ManagerEvent } from "@/domain/boletim/enterprise/events/manager-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnManagerUpdated implements EventHandler {
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

  private async sendUpdateManagerReport({ manager, reporterId, courseId, reporterIp, ocurredAt }: ManagerEvent) {
    const reporter = await this.reportersRepository.findById({ id: reporterId })
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    if (reporter) {
      await this.sendReport.execute({
        title: 'Gerente atualizado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value}
          Gerente: ${manager.username.value}
          Data: ${formattedDate}
          ${reporter.username.value} atualizou o gerente: ${manager.username.value}
        `,
        ip: reporterIp,
        courseId,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}