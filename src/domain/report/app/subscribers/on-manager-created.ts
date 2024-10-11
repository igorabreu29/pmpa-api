import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { StudentEvent } from "@/domain/boletim/enterprise/events/student-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ManagerEvent } from "@/domain/boletim/enterprise/events/manager-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnManagerCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewManagerReport.bind(this),
      ManagerEvent.name
    )
  }

  private async sendNewManagerReport({ manager, courseId, reporterId, reporterIp, ocurredAt }: ManagerEvent) {
    const [reporter, course] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
      this.coursesRepository.findById(String(courseId))
    ])

    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    if (reporter && course) {
      await this.sendReport.execute({
        title: 'Gerente criado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (${reporter.role})
          Gerente: ${manager.username.value}
          Curso: ${course.name.value}
          Data: ${formattedDate}
          ${reporter.username.value} adicionou o gerente: ${manager.username.value}
        `,
        ip: reporterIp,
        courseId,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}