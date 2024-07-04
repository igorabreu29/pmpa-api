import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { DisciplinesRepository } from "@/domain/boletim/app/repositories/disiciplines-repository.ts";
import { PolesRepository } from "@/domain/boletim/app/repositories/poles-repository.ts";
import { UsersRepository } from "@/domain/boletim/app/repositories/users-repository.ts";
import { AssessmentEvent } from "@/domain/boletim/enterprise/events/assessment-event.ts";

export class OnAssessmentDeleted implements EventHandler {
  constructor (
    private usersRepository: UsersRepository,
    private poleRepository: PolesRepository,
    private disciplinesRepository: DisciplinesRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAssessmentReport.bind(this),
      AssessmentEvent.name
    )
  }

  private async sendNewAssessmentReport({ assessment }: AssessmentEvent) {
    const user = await this.usersRepository.findById(assessment.studentId.toValue())
    const pole = await this.poleRepository.findById(assessment.poleId.toValue())

    if (pole) {
      await this.sendReport.execute({
        title: `Removeu notas`,
        content: `${pole?.managerName} removeu as notas do estudante: ${user?.username}`,
      })
    }
  }
}