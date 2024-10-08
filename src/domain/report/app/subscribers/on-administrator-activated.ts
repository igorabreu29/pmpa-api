import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { ChangeAdministratorStatusEvent } from "@/domain/boletim/enterprise/events/change-administrator-status.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnAdministratorActivated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendActiveAdministratorReport.bind(this),
      ChangeAdministratorStatusEvent.name
    )
  }

  private async sendActiveAdministratorReport({ administrator, reason, reporterId, reporterIp, ocurredAt }: ChangeAdministratorStatusEvent) {
    const [reporter] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
    ])

    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - hh:mm:ss')

    if (reporter) {
      await this.sendReport.execute({
        title: 'Administrador Ativado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (${reporter.role})
          Administrador: ${administrator?.username.value}
          Data: ${formattedDate}
          Razão: ${reason}
          ${reporter?.username.value} ativou o aluno: ${administrator?.username.value}
        `,
        ip: reporterIp,
        reporterId: reporterId,
        action: 'status'
      })
    }
  }
}