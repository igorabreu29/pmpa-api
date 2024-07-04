import { AssessmentBatch } from "../../enterprise/entities/assessment-batch.ts";

export abstract class AssessmentsBatchRepository {
  abstract create(assessmentBatch: AssessmentBatch): Promise<void>
}