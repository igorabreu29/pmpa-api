import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ChangeManagerStatusEvent } from "@/domain/boletim/enterprise/events/change-manager-status-event.ts";
import type { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";

export class OnManagerDisabled implements EventHandler {
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
      this.sendDisableManagerReport.bind(this),
      ChangeManagerStatusEvent.name
    )
  }

  private async sendDisableManagerReport({ managerCourse, reason, reporterId, reporterIp, ocurredAt }: ChangeManagerStatusEvent) {
    const [reporter, manager, course] = await Promise.all([
      this.reportersRepository.findById({ id: reporterId }),
      this.managersRepository.findById(managerCourse.managerId.toValue()),
      this.coursesRepository.findById(managerCourse.courseId.toValue())
    ])

    if (course) {
      await this.sendReport.execute({
        title: 'Gerente desativado',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter?.username.value}
          Gerente: ${manager?.username.value}
          Curso: ${course.name.value}
          Data: ${ocurredAt}
          Razão: ${reason}
          ${reporter?.username.value} desativou o gerente: ${manager?.username.value}
        `,
        ip: reporterIp,
        courseId: course.id.toValue(),
        reporterId: reporterId,
        action: 'status'
      })
    }
  }
}