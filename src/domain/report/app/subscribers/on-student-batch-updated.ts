import { EventHandler } from "@/core/events/event-handler.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { ReportersRepository } from "../repositories/reporters-repository.ts";
import { SendReportBatchUseCase } from "../use-cases/send-report-batch.ts";
import { StudentBatchEvent } from "@/domain/boletim/enterprise/events/student-batch-event.ts";

export class OnStudentBatchUpdated implements EventHandler {
  constructor (
    private reportersRepository: ReportersRepository,
    private coursesRepository: CoursesRepository,
    private sendReportBatch: SendReportBatchUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendUpdateStudentBatchReport.bind(this),
      StudentBatchEvent.name
    )
  }

  private async sendUpdateStudentBatchReport({ studentBatch, reporterIp, ocurredAt }: StudentBatchEvent) {
    const [course, reporter] = await Promise.all([
      this.coursesRepository.findById(studentBatch.courseId.toValue()),
      this.reportersRepository.findById({ id: studentBatch.userId.toValue() })
    ])

    if (course && reporter) {
      await this.sendReportBatch.execute({
        title: 'Notas atualizadas em lote',
        content: `
          IP: ${reporterIp} \n
          Course: ${course.name.value} \n
          Remetente: ${reporter.username.value} \n
          Link do arquivo: ${studentBatch.fileLink} \n
          Data: ${ocurredAt} \n
          ${reporter.username.value} adicionou notas em lote
        `,
        reporterId: reporter.id.toValue(),
        reporterIp,
        fileLink: studentBatch.fileLink,
        fileName: studentBatch.fileName,
        action: 'update'
      })
    }
  }
}