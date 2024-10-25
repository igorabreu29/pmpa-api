import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { AssessmentBatchEvent } from "@/domain/boletim/enterprise/events/assessment-batch-event.ts";
import { SendReportBatchUseCase } from "../use-cases/send-report-batch.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnAssessmentBatchUpdated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReportBatch: SendReportBatchUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendUpdateAssessmentBatchReport.bind(this),
      AssessmentBatchEvent.name
    )
  }

  private async sendUpdateAssessmentBatchReport({ assessmentBatch, reporterIp, ocurredAt }: AssessmentBatchEvent) {
    const [course, reporter] = await Promise.all([
      this.coursesRepository.findById(assessmentBatch.courseId.toValue()),
      this.reportersRepository.findById({ id: assessmentBatch.userId.toValue() })
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    if (course && reporter) {
      await this.sendReportBatch.execute({
        title: 'Notas atualizadas em lote',
        content: `
          IP: ${reporterIp}
          Course: ${course.name.value}
          Remetente: ${reporter.username.value} (${reporter.role})
          Data: ${formattedDate}
          ${reporter.username.value} atualizou notas em lote
        `,
        courseId: assessmentBatch.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        reporterIp,
        fileLink: assessmentBatch.fileLink,
        fileName: assessmentBatch.fileName,
        action: 'update'
      })
    }
  }
}