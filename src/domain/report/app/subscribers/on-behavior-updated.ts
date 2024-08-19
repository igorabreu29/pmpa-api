import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { BehaviorEvent } from "@/domain/boletim/enterprise/events/behavior-event.ts";
import { BehaviorUpdatedEvent } from "@/domain/boletim/enterprise/events/behavior-updated-event.ts";

export class OnBehaviorUpdated implements EventHandler {
  constructor (
    private studentsRepository: StudentsRepository,
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendUpdateBehaviorReport.bind(this),
      BehaviorUpdatedEvent.name
    )
  }

  private async sendUpdateBehaviorReport({ behavior, reporterId, reporterIp, ocurredAt }: BehaviorUpdatedEvent) {
    const [course, reporter, student] = await Promise.all([
      this.coursesRepository.findById(behavior.courseId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(behavior.studentId.toValue())
    ])

    if (course && reporter && student) {
      await this.sendReport.execute({
        title: 'Notas de comportamento atualizadas',
        content: `
          IP: ${reporterIp} \n
          Curso: ${course.name.value} \n
          Remetente: ${reporter.username.value} \n
          Estudante: ${student.username.value} \n
          Data: ${ocurredAt} \n
          ${reporter.username.value} atualizou notas de comportamento do aluno: ${student.username.value}
        `,
        ip: reporterIp,
        reporterId,
        action: 'update'
      })
    }
  }
}