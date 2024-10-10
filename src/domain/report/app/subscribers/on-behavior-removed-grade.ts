import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import 'dayjs/locale/pt-br.js';
import { BehaviorRemovedGradeEvent } from "@/domain/boletim/enterprise/events/behavior-removed-grade.ts";

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnBehaviorRemovedGrade implements EventHandler {
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
      this.sendRemoveGradeBehaviorReport.bind(this),
      BehaviorRemovedGradeEvent.name
    )
  }

  private async sendRemoveGradeBehaviorReport({ previousBehavior, behavior, reporterId, reporterIp, ocurredAt }: BehaviorRemovedGradeEvent) {
    const [course, reporter, student] = await Promise.all([
      this.coursesRepository.findById(behavior.courseId.toValue()),
      this.reportersRepository.findById({ id: reporterId }),
      this.studentsRepository.findById(behavior.studentId.toValue())
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY - hh:mm:ss')

    const januaryWasUpdated = previousBehavior.january !== behavior.january
    const februaryWasUpdated = previousBehavior.february !== behavior.february
    const marchWasUpdated = previousBehavior.march !== behavior.march
    const aprilWasUpdated = previousBehavior.april !== behavior.april
    const mayWasUpdated = previousBehavior.may !== behavior.may
    const junWasUpdated = previousBehavior.jun !== behavior.jun
    const julyWasUpdated = previousBehavior.july !== behavior.july
    const augustWasUpdated = previousBehavior.august !== behavior.august
    const septemberWasUpdated = previousBehavior.september !== behavior.september
    const octoberWasUpdated = previousBehavior.october !== behavior.october
    const novemberWasUpdated = previousBehavior.november !== behavior.november
    const decemberWasUpdated = previousBehavior.december !== behavior.december

    if (course && reporter && student) {
      await this.sendReport.execute({
        title: 'Notas de comportamento removidas',
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Remetente: ${reporter.username.value} (${reporter.role})
          Estudante: ${student.username.value}
          Data: ${formattedDate}

          ${reporter.username.value} deletou notas de comportamento do aluno: ${student.username.value}
          JANEIRO: ${januaryWasUpdated ? `${previousBehavior.january} removida` : behavior.january ?? ''}
          FEVEREIRO: ${februaryWasUpdated ? `${previousBehavior.february} removida` : behavior.february ?? ''}
          MARÇO: ${marchWasUpdated ? `${previousBehavior.march} removida` : behavior.march ?? ''}
          ABRIL: ${aprilWasUpdated ? `${previousBehavior.april} removida` : behavior.april ?? ''}
          MAIO: ${mayWasUpdated ? `${previousBehavior.may} removida` : behavior.may ?? ''}
          JUN: ${junWasUpdated ? `${previousBehavior.jun} removida` : behavior.jun ?? ''}
          JULHO: ${julyWasUpdated ? `${previousBehavior.july} removida` : behavior.july ?? ''}
          AGOSTO: ${augustWasUpdated ? `${previousBehavior.august} removida` : behavior.august ?? ''}
          SETEMBRO: ${septemberWasUpdated ? `${previousBehavior.september} removida` : behavior.september ?? ''}
          OUTUBRO: ${octoberWasUpdated ? `${previousBehavior.october} removida` : behavior.october ?? ''}
          NOVEMBRO: ${novemberWasUpdated ? `${previousBehavior.november} removida` : behavior.november ?? ''}
          DEZEMBRO: ${decemberWasUpdated ? `${previousBehavior.december} removida` : behavior.december ?? ''}
        `,
        courseId: behavior.courseId.toValue(),
        ip: reporterIp,
        reporterId,
        action: 'remove'
      })
    }
  }
}