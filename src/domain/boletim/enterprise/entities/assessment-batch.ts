import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Assessment } from "./assessment.ts";
import { AggregateRoot } from "@/core/entities/aggregate-root.ts";
import { AssessmentBatchCreatedEvent } from "../events/assessments-batch-created-event.ts";

interface AssessmentBatchProps {
  courseId: UniqueEntityId
  userId: UniqueEntityId
  assessments: Assessment[]
  userIP: string
}

export class AssessmentBatch extends AggregateRoot<AssessmentBatchProps> {
  get courseId() {
    return this.props.courseId
  }

  get userId() {
    return this.props.userId
  }

  get assessments() {
    return this.props.assessments
  }

  get userIP() {
    return this.props.userIP
  }
  
  static create(props: AssessmentBatchProps, id?: UniqueEntityId) {
    const assessmentBatch = new AssessmentBatch(props, id)

    const isNewAssessmentBatch = !id
    if (isNewAssessmentBatch) {
      assessmentBatch.addDomainEvent(new AssessmentBatchCreatedEvent(assessmentBatch, assessmentBatch.userIP))
    }

    return assessmentBatch
  }
}