import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";
import { AssessmentRemovedGradeEvent } from "@/domain/boletim/enterprise/events/assessment-removed-grade-event.ts";

export class OnAssessmentRemovedGrade implements EventHandler {
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
      this.sendRemoveGradeAssessmentReport.bind(this),
      AssessmentRemovedGradeEvent.name
    )
  }

  private async sendRemoveGradeAssessmentReport({ assessment, reporterId, reporterIp, ocurredAt }: AssessmentRemovedGradeEvent) {
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
          Data: ${ocurredAt}
          ${reporter.username.value} atualizou notas do aluno: ${student.username.value}
        `,
        ip: reporterIp,
        courseId: assessment.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'update'
      })
    }
  }
}