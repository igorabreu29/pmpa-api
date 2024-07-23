import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportBatchUseCase } from "../use-cases/send-report-batch.ts";
import { BehaviorBatchCreatedEvent } from "@/domain/boletim/enterprise/events/behavior-batch-created-event.ts";

export class OnBehaviorBatchCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReportBatch: SendReportBatchUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewBehaviorBatchReport.bind(this),
      BehaviorBatchCreatedEvent.name
    )
  }

  private async sendNewBehaviorBatchReport({ behaviorBatch, reporterIp, ocurredAt }: BehaviorBatchCreatedEvent) {
    const course = await this.coursesRepository.findById(behaviorBatch.courseId.toValue())
    const reporter = await this.reportersRepository.findById({ id: behaviorBatch.userId.toValue() })

    if (course && reporter) {
      await this.sendReportBatch.execute({
        title: 'Notas de comportamento adicionadas em lote',
        content: `
          IP: ${reporterIp} \n
          Course: ${course.name.value} \n
          Remetente: ${reporter.username.value} \n
          Link do arquivo: ${behaviorBatch.fileLink} \n
          Data: ${ocurredAt} \n
          ${reporter.username.value} adicionou notas de comportamento em lote
        `,
        reporterId: reporter.id.toValue(),
        reporterIp,
        fileLink: behaviorBatch.fileLink,
        fileName: behaviorBatch.fileName,
        action: 'add'
      })
    }
  }
}