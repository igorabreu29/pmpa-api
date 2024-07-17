import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { DisciplinesRepository } from "@/domain/boletim/app/repositories/disiciplines-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { AssessmentEvent } from "@/domain/boletim/enterprise/events/assessment-event.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";

export class OnAssessmentUpdated implements EventHandler {
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
      this.sendUpdateAssessmentReport.bind(this),
      AssessmentEvent.name
    )
  }

  private async sendUpdateAssessmentReport({ assessment, reporterId, reporterIp, ocurredAt }: AssessmentEvent) {
    const course = await this.coursesRepository.findById(assessment.courseId.toValue())
    const discipline = await this.disciplinesRepository.findById(assessment.disciplineId.toValue())
    const reporter = await this.reportersRepository.findById({ id: reporterId })
    const student = await this.studentsRepository.findById(assessment.studentId.toValue())

    if (course && discipline && reporter && student) {
      await this.sendReport.execute({
        title: `Notas Atualizadas`,
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
        reporterId: reporter.id.toValue(),
        action: 'update'
      })
    }
  }
}