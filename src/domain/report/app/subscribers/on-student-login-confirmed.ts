import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { StudentLoginConfirmedEvent } from "@/domain/boletim/enterprise/events/student-login-confirmed-event.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnStudentLoginConfirmed implements EventHandler {
  constructor(
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register (
      this.sendStudentLoginConfirmedReport.bind(this),
      StudentLoginConfirmedEvent.name
    )
  } 

  private async sendStudentLoginConfirmedReport({ student, studentIp, ocurredAt }: StudentLoginConfirmedEvent) {
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    await this.sendReport.execute({
      title: `Confirmação de login`,
      content: `
        IP: ${studentIp}
        Estudante: ${student.username.value}
        Data: ${formattedDate}
        ${student.username.value} confirmou seu login!
      `,
      ip: studentIp,
      reporterId: student.id.toValue(),
      action: 'login confirmed'
    })
  }
}