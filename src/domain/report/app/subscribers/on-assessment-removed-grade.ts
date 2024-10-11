import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";
import { AssessmentRemovedGradeEvent } from "@/domain/boletim/enterprise/events/assessment-removed-grade-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

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

  private async sendRemoveGradeAssessmentReport({ previousAssessment, assessment, reporterId, reporterIp, ocurredAt }: AssessmentRemovedGradeEvent) {
    const [course, discipline, reporter, student] = await Promise.all([
      this.coursesRepository.findById(assessment.courseId.toValue()),
      this.disciplinesRepository.findById(assessment.disciplineId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(assessment.studentId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    const vfWasRemoved = previousAssessment.vf !== assessment.vf
    const aviWasRemoved = previousAssessment.avi !== assessment.avi
    const aviiWasRemoved = previousAssessment.avii !== assessment.avii
    const vfeWasRemoved = previousAssessment.vfe !== assessment.vfe

    if (course && discipline && reporter && student) {
      await this.sendReport.execute({
        title: `Notas removidas`,
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Disciplina: ${discipline.name.value}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Data: ${formattedDate}

          ${reporter.username.value} removeu notas do aluno: ${student.username.value}
          VF: ${vfWasRemoved ? `${previousAssessment.vf} removida` : assessment.vf ?? ''}
          AVI: ${aviWasRemoved ? `${previousAssessment.avi} removida` : assessment.avi ?? ''}
          AVII: ${aviiWasRemoved ? `${previousAssessment.avii} removida` : assessment.avii ?? ''}
          VFE: ${vfeWasRemoved ? `${previousAssessment.vfe} removida` : assessment.vfe ?? ''}
        `,
        ip: reporterIp,
        courseId: assessment.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        action: 'remove'
      })
    }
  }
}