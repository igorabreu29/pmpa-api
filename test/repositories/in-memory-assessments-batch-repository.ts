import { DomainEvents } from "@/core/events/domain-events.ts";
import { AssessmentsBatchRepository } from "@/domain/boletim/app/repositories/assessments-batch-repository.ts";
import { AssessmentBatch } from "@/domain/boletim/enterprise/entities/assessment-batch.ts";

export class InMemoryAssessmentsBatchRepository implements AssessmentsBatchRepository {
  public items: AssessmentBatch[] = []

  async create(assessmentBatch: AssessmentBatch): Promise<void> {
    this.items.push(assessmentBatch)

    DomainEvents.dispatchEventsForAggregate(assessmentBatch.id)
  }
}