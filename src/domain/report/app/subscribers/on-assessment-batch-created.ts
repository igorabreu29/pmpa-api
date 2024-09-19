import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { AssessmentBatchEvent } from "@/domain/boletim/enterprise/events/assessment-batch-event.ts";
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
      AssessmentBatchEvent.name
    )
  }

  private async sendNewAssessmentBatchReport({ assessmentBatch, reporterIp, ocurredAt }: AssessmentBatchEvent) {
    const [course, reporter] = await Promise.all([
      this.coursesRepository.findById(assessmentBatch.courseId.toValue()),
      this.reportersRepository.findById({ id: assessmentBatch.userId.toValue() })
    ])

    if (course && reporter) {
      await this.sendReportBatch.execute({
        title: 'Notas em lote',
        content: `
          IP: ${reporterIp}
          Course: ${course.name.value}
          Remetente: ${reporter.username.value}
          Link do arquivo: ${assessmentBatch.fileLink}
          Data: ${ocurredAt}
          ${reporter.username.value} adicionou/atualizou notas em lote
        `,
        reporterId: reporter.id.toValue(),
        reporterIp,
        courseId: course.id.toValue(),
        fileLink: assessmentBatch.fileLink,
        fileName: assessmentBatch.fileName,
        action: 'add'
      })
    }
  }
}