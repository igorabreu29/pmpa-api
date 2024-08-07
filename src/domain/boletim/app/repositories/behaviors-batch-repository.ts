import { BehaviorBatch } from "../../enterprise/entities/behavior-batch.ts";

export abstract class BehaviorsBatchRepository {
  abstract create(behaviorBatch: BehaviorBatch): Promise<void>
  abstract save(behaviorBatch: BehaviorBatch): Promise<void>
}