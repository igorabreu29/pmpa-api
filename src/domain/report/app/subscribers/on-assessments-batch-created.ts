import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { AssessmentBatchCreatedEvent } from "@/domain/boletim/enterprise/events/assessments-batch-created-event.ts";
import { UsersRepository } from "@/domain/boletim/app/repositories/users-repository.ts";
import { AttachmentsRepository } from "@/domain/boletim/app/repositories/attachments-repository.ts";

export class OnAssessmentsBatchCreated implements EventHandler {
  constructor (
    private usersRepository: UsersRepository,
    private attachmentsRepository: AttachmentsRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAssessmentsBatchReport.bind(this),
      AssessmentBatchCreatedEvent.name
    )
  }

  private async sendNewAssessmentsBatchReport({ assessmentBatch, userIP }: AssessmentBatchCreatedEvent) {
    const user = await this.usersRepository.findById(assessmentBatch.userId.toValue())
    const attachment = await this.attachmentsRepository.findByCourseId(assessmentBatch.courseId.toValue())

    if (user) {
      await this.sendReport.execute({
        title: `Adicionar notas em lote`,
        content: `
          ${user?.username} adicionou notas em lote.
          Nome do arquivo: ${attachment?.fileName}, link: ${attachment?.fileLink}
        `,
      })
    }
  }
}