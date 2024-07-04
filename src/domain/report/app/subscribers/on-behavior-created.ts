import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { UsersRepository } from "@/domain/boletim/app/repositories/users-repository.ts";
import { BehaviorCreatedEvent } from "@/domain/boletim/enterprise/events/behavior-created-event.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

export class OnBehaviorCreated implements EventHandler {
  constructor (
    private polesReposiory: InMemoryPolesRepository,
    private usersRepository: UsersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewBehaviorReport.bind(this),
      BehaviorCreatedEvent.name
    )
  }

  private async sendNewBehaviorReport({ behavior }: BehaviorCreatedEvent) {
    const pole = await this.polesReposiory.findById(behavior.poleId.toValue())
    const user = await this.usersRepository.findById(behavior.studentId.toValue())

    if (pole) {
      await this.sendReport.execute({
        title: `Adiciona Comportamento`,
        content: `${pole?.managerName} adicionou comportamento do estudante: ${user?.username}`,
      })
    }
  }
}