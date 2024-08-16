import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Batch, BatchProps } from "./batch.ts";
import { Behavior } from "./behavior.ts";
import { BehaviorBatchEvent } from "../events/behavior-batch-event.ts";

interface BehaviorBatchProps extends BatchProps {
  behaviors: Behavior[]
}

export class BehaviorBatch extends Batch<BehaviorBatchProps> {
  get behaviors() {
    return this.props.behaviors
  }
  
  static create(props: BehaviorBatchProps, id?: UniqueEntityId) {
    const behaviorBatch = new BehaviorBatch(props, id)

    const isNewBehaviorBatch = !id
    if (isNewBehaviorBatch) {
      behaviorBatch.addDomainEvent(new BehaviorBatchEvent({
        behaviorBatch,
        reporterIp: behaviorBatch.userIp
      }))
    }

    return behaviorBatch
  }
}