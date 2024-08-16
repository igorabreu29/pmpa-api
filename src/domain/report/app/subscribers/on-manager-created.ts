import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { StudentEvent } from "@/domain/boletim/enterprise/events/student-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ManagerEvent } from "@/domain/boletim/enterprise/events/manager-event.ts";

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
    const reporter = await this.reportersRepository.findById({ id: reporterId })
    const course = await this.coursesRepository.findById(String(courseId))

    if (reporter && course) {
      await this.sendReport.execute({
        title: 'Gerente criado',
        content: `
          IP: ${reporterIp} \n
          Remetente: ${reporter.username.value} \n
          Gerente: ${manager.username.value} \n
          Curso: ${course.name.value}
          Data: ${ocurredAt}
          ${reporter.username.value} adicionou o gerente: ${manager.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'add'
      })
    }
  }
}