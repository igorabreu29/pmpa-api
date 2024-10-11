import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";
import { AssessmentDeletedEvent } from "@/domain/boletim/enterprise/events/assessment-deleted-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

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
      AssessmentDeletedEvent.name
    )
  }

  private async sendDeleteAssessmentReport({ assessment, reporterId, reporterIp, ocurredAt }: AssessmentDeletedEvent) {
    const [course, discipline, reporter, student] = await Promise.all([
      this.coursesRepository.findById(assessment.courseId.toValue()),
      this.disciplinesRepository.findById(assessment.disciplineId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(assessment.studentId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    if (course && discipline && reporter && student) {
      await this.sendReport.execute({
        title: `Notas removidas`,
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Disciplina: ${discipline.name}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Data: ${formattedDate}
          ${reporter.username.value} removeu notas do aluno: ${student.username.value}
        `,
        ip: reporterIp,
        courseId: assessment.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}