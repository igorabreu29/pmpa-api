import { EventHandler } from "@/core/events/event-handler.ts";
import { SendReportUseCase } from "../use-cases/send-report.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import { UsersRepository } from "@/domain/boletim/app/repositories/users-repository.ts";
import { BehaviorCreatedEvent } from "@/domain/boletim/enterprise/events/behavior-created-event.ts";
import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

export class OnBehaviorDeleted implements EventHandler {
  constructor (
    private coursesRepository: CoursesRepository,
    private polesReposiory: InMemoryPolesRepository,
    private usersRepository: UsersRepository,
    private sendReport: SendReportUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendDeleteBehaviorReport.bind(this),
      BehaviorCreatedEvent.name
    )
  }

  private async sendDeleteBehaviorReport({ behavior }: BehaviorCreatedEvent) {
    const pole = await this.polesReposiory.findById(behavior.poleId.toValue())
    const user = await this.usersRepository.findById(behavior.studentId.toValue())

    if (pole) {
      await this.sendReport.execute({
        title: `Deleta Comportamento`,
        content: `${pole?.managerName} deletou comportamento do estudante: ${user?.username}`,
      })
    }
  }
}