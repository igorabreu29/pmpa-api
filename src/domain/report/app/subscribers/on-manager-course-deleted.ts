import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import 'dayjs/locale/pt-br.js';
import type { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ManagerCourseDeletedEvent } from "@/domain/boletim/enterprise/events/manager-course-deleted-event.ts";
import type { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnManagerCourseDeleted implements EventHandler {
  constructor (
    private coursesRepository: CoursesRepository,
    private managerRepository: ManagersRepository,
    private reportersRepository: ReportersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteManagerCourseReport.bind(this),
      ManagerCourseDeletedEvent.name
    )
  }

  private async sendDeleteManagerCourseReport({ managerCourse, reporterId, reporterIp, ocurredAt }: ManagerCourseDeletedEvent) {
    const [course, manager, reporter] = await Promise.all([
      this.coursesRepository.findById(managerCourse.courseId.toValue()),
      this.managerRepository.findById(managerCourse.managerId.toValue()),
      this.reportersRepository.findById({ id: reporterId })
    ])
    
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - hh:mm:ss')

    if (course && manager && reporter) {
      await this.sendReport.execute({
        title: 'Gerente deletado do curso',
        content: `
          IP: ${reporterIp}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${manager.username.value}
          Curso: ${course.name.value}
          Data: ${formattedDate}
          ${reporter.username.value} deletou o gerente: ${manager.username.value} do curso: ${course.name.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}