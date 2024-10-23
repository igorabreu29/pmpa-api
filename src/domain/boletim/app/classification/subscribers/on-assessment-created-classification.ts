import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";

import { CreateStudentClassificationUseCase } from "../../use-cases/create-student-classification.ts";
import { AssessmentEvent } from "@/domain/boletim/enterprise/events/assessment-event.ts";

export class OnAssessmentCreatedClassification implements EventHandler {
  constructor (
    private createStudentClassification: CreateStudentClassificationUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.generateStudentClassification.bind(this),
      AssessmentEvent.name
    )
  }

  private async generateStudentClassification({ assessment }: AssessmentEvent) {
    if (assessment) {
      await this.createStudentClassification.execute({
        courseId: assessment.courseId.toValue(),
        studentId: assessment.studentId.toValue()
      })
    }
  }
}