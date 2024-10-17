import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportBatchUseCase } from "../use-cases/send-report-batch.ts";
import { BehaviorBatchEvent } from "@/domain/boletim/enterprise/events/behavior-batch-event.ts";

import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import 'dayjs/locale/pt-br.js'

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export class OnBehaviorBatchUpdated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReportBatch: SendReportBatchUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendUpdateBehaviorBatchReport.bind(this),
      BehaviorBatchEvent.name
    )
  }

  private async sendUpdateBehaviorBatchReport({ behaviorBatch, reporterIp, ocurredAt }: BehaviorBatchEvent) {
    const [course, reporter] = await Promise.all([
      this.coursesRepository.findById(behaviorBatch.courseId.toValue()),
      this.reportersRepository.findById({ id: behaviorBatch.userId.toValue() })
    ])
    const formattedDate = dayjs(ocurredAt).format('DD/MM/YYYY HH:mm:ss')

    if (course && reporter) {
      await this.sendReportBatch.execute({
        title: 'Notas de comportamento atualizadas em lote',
        content: `
          IP: ${reporterIp}
          Curso: ${course.name.value}
          Remetente: ${reporter.username.value} (${reporter.role})
          Data: ${formattedDate}
          ${reporter.username.value} atualizou notas de comportamento em lote
        `,
        courseId: behaviorBatch.courseId.toValue(),
        reporterId: reporter.id.toValue(),
        reporterIp,
        fileLink: behaviorBatch.fileLink,
        fileName: behaviorBatch.fileName,
        action: 'add'
      })
    }
  }
}