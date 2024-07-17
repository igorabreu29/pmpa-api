import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Assessment } from "./assessment.ts";
import { AssessmentBatchCreatedEvent } from "../events/assessment-batch-created-event.ts";
import { Batch, BatchProps } from "./batch.ts";

interface AssessmentBatchProps extends BatchProps {
  assessments: Assessment[]
}

export class AssessmentBatch extends Batch<AssessmentBatchProps> {
  get assessments() {
    return this.props.assessments
  }
  
  static create(props: AssessmentBatchProps, id?: UniqueEntityId) {
    const assessmentBatch = new AssessmentBatch(props, id)

    const isNewAssessmentBatch = !id
    if (isNewAssessmentBatch) {
      assessmentBatch.addDomainEvent(new AssessmentBatchCreatedEvent({
        assessmentBatch,
        reporterIp: assessmentBatch.userIp
      }))
    }

    return assessmentBatch
  }
}