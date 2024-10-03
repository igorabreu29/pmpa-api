import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";
import { AssessmentUpdatedEvent } from "@/domain/boletim/enterprise/events/assessment-updated-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

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
      AssessmentUpdatedEvent.name
    )
  }

  private async sendUpdateAssessmentReport({ previousAssessment, assessment, reporterId, reporterIp, ocurredAt }: AssessmentUpdatedEvent) {
    const [course, discipline, reporter, student] = await Promise.all([
      this.coursesRepository.findById(assessment.courseId.toValue()),
      this.disciplinesRepository.findById(assessment.disciplineId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(assessment.studentId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - HH:mm:ss')

    const vfWasUpdated = previousAssessment.vf !== assessment.vf
    const aviWasUpdated = previousAssessment.avi !== assessment.avi
    const aviiWasUpdated = previousAssessment.avii !== assessment.avii
    const vfeWasUpdated = previousAssessment.vfe !== assessment.vfe

    if (course && discipline && reporter && student) {
      await this.sendReport.execute({
        title: `Notas Atualizadas`,
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Disciplina: ${discipline.name.value}
          Remetente: ${reporter.username.value}
          Estudante: ${student.username.value}
          Data: ${formattedDate}
        
          ${reporter.username.value} atualizou notas do aluno: ${student.username.value}
          VF: ${vfWasUpdated ? `${previousAssessment.vf} para ${assessment.vf}` : assessment.vf}
          VF: ${aviWasUpdated ? `${previousAssessment.avi} para ${assessment.avi}` : assessment.avi}
          VF: ${aviiWasUpdated ? `${previousAssessment.avii} para ${assessment.avii}` : assessment.avii}
          VF: ${vfeWasUpdated ? `${previousAssessment.vfe} para ${assessment.vfe}` : assessment.vfe}
        `,
        ip: reporterIp,
        courseId: assessment.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'update'
      })
    }
  }
}