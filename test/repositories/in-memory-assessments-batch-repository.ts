import { DomainEvents } from "@/core/events/domain-events.ts";
import { AssessmentsBatchRepository } from "@/domain/boletim/app/repositories/assessments-batch-repository.ts";
import { AssessmentBatch } from "@/domain/boletim/enterprise/entities/assessment-batch.ts";
import type { InMemoryAssessmentsRepository } from "./in-memory-assessments-repository.ts";

export class InMemoryAssessmentsBatchRepository implements AssessmentsBatchRepository {
  public items: AssessmentBatch[] = []

  constructor(
    private assessmentsRepository: InMemoryAssessmentsRepository
  ) {}

  async create(assessmentBatch: AssessmentBatch): Promise<void> {
    this.items.push(assessmentBatch)

    DomainEvents.dispatchEventsForAggregate(assessmentBatch.id)
  }

  async save(assessmentBatch: AssessmentBatch): Promise<void> {
    this.items.push(assessmentBatch)

    const assessmentBatchIndex = this.items.findIndex(item => item.id.equals(assessmentBatch.id))
    this.items[assessmentBatchIndex] = assessmentBatch

    assessmentBatch.assessments.forEach(assessment => {{
      const assessmentIndex = this.assessmentsRepository.items.findIndex(item => item.id.equals(assessment.id))
      this.assessmentsRepository.items[assessmentIndex] = assessment
    }})

    DomainEvents.dispatchEventsForAggregate(assessmentBatch.id)
  }
}