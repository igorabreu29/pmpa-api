import { DomainEvents } from "@/core/events/domain-events.ts";
import { BehaviorsBatchRepository } from "@/domain/boletim/app/repositories/behaviors-batch-repository.ts";
import { BehaviorBatch } from "@/domain/boletim/enterprise/entities/behavior-batch.ts";

export class InMemoryBehaviorsBatchRepository implements BehaviorsBatchRepository {
  public items: BehaviorBatch[] = []

  async create(behaviorBatch: BehaviorBatch): Promise<void> {
    this.items.push(behaviorBatch)

    DomainEvents.dispatchEventsForAggregate(behaviorBatch.id)
  }
}