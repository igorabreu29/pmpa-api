import { DomainEvents } from "@/core/events/domain-events.ts";
import { EventHandler } from "@/core/events/event-handler.ts";

import { AssessmentUpdatedEvent } from "@/domain/boletim/enterprise/events/assessment-updated-event.ts";
import { UpdateStudentClassificationUseCase } from "../../use-cases/update-student-classification.ts";

export class OnAssessmentUpdatedClassification implements EventHandler {
  constructor (
    private updateStudentClassification: UpdateStudentClassificationUseCase
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.generateStudentClassification.bind(this),
      AssessmentUpdatedEvent.name
    )
  }

  private async generateStudentClassification({ assessment }: AssessmentUpdatedEvent) {
    if (assessment) {
      await this.updateStudentClassification.execute({
        courseId: assessment.courseId.toValue(),
        studentId: assessment.studentId.toValue()
      })
    }
  }
}