import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ChangeManagerStatusEvent } from "@/domain/boletim/enterprise/events/change-manager-status-event.ts";
import type { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnManagerActivated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private managersRepository: ManagersRepository,
    private coursesRepository: CoursesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendActiveManagerReport.bind(this),
      ChangeManagerStatusEvent.name
    )
  }

  private async sendActiveManagerReport({ managerCourse, reason, reporterId, reporterIp, ocurredAt }: ChangeManagerStatusEvent) {
    const [reporter, manager, course] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
      this.managersRepository.findById(managerCourse.managerId.toValue()),
      this.coursesRepository.findById(managerCourse.courseId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    if (course && reporter) {
      await this.sendReport.execute({
        title: 'Gerente Ativado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (${reporter.role})
          Gerente: ${manager?.username.value}
          Curso: ${course.name.value}
          Data: ${formattedDate}
          Razão: ${reason}
          ${reporter?.username.value} ativou o gerente: ${manager?.username.value}
        `,
        ip: reporterIp,
        courseId: course.id.toValue(),
        reporterId: reporterId,
        action: 'status'
      })
    }
  }
}