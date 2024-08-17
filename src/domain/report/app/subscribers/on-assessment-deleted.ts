import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { AssessmentEvent } from "@/domain/boletim/enterprise/events/assessment-event.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";

export class OnAssessmentDeleted implements EventHandler {
  constructor (
    private studentsRepository: StudentsRepository,
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteAssessmentReport.bind(this),
      AssessmentEvent.name
    )
  }

  private async sendDeleteAssessmentReport({ assessment, reporterId, reporterIp, ocurredAt }: AssessmentEvent) {
    const [course, discipline, reporter, student] = await Promise.all([
      this.coursesRepository.findById(assessment.courseId.toValue()),
      this.disciplinesRepository.findById(assessment.disciplineId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(assessment.studentId.toValue())
    ])

    if (course && discipline && reporter && student) {
      await this.sendReport.execute({
        title: `Notas removidas`,
        content: `
          IP: ${reporterIp} \n
          Course: ${course.name.value} \n
          Disciplina: ${discipline.name} \n
          Remetente: ${reporter.username.value} \n
          Estudante: ${student.username.value} \n
          Data: ${ocurredAt} \n
          ${reporter.username.value} removeu notas do aluno: ${student.username.value}
        `,
        ip: reporterIp,
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}