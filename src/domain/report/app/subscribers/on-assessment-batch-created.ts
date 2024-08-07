import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { AssessmentBatchCreatedEvent } from "@/domain/boletim/enterprise/events/assessment-batch-created-event.ts";
import { SendReportBatchUseCase } from "../use-cases/send-report-batch.ts";

export class OnAssessmentBatchCreated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReportBatch: SendReportBatchUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAssessmentBatchReport.bind(this),
      AssessmentBatchCreatedEvent.name
    )
  }

  private async sendNewAssessmentBatchReport({ assessmentBatch, reporterIp, ocurredAt }: AssessmentBatchCreatedEvent) {
    const course = await this.coursesRepository.findById(assessmentBatch.courseId.toValue())
    const reporter = await this.reportersRepository.findById({ id: assessmentBatch.userId.toValue() })

    if (course && reporter) {
      await this.sendReportBatch.execute({
        title: 'Notas em lote',
        content: `
          IP: ${reporterIp} \n
          Course: ${course.name.value} \n
          Remetente: ${reporter.username.value} \n
          Link do arquivo: ${assessmentBatch.fileLink} \n
          Data: ${ocurredAt} \n
          ${reporter.username.value} adicionou/atualizou notas em lote
        `,
        reporterId: reporter.id.toValue(),
        reporterIp,
        fileLink: assessmentBatch.fileLink,
        fileName: assessmentBatch.fileName,
        action: 'add'
      })
    }
  }
}