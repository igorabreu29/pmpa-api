import { DomainEvents } from "@/core/events/domain-events.ts";
import { BehaviorsBatchRepository } from "@/domain/boletim/app/repositories/behaviors-batch-repository.ts";
import { BehaviorBatch } from "@/domain/boletim/enterprise/entities/behavior-batch.ts";
import { InMemoryBehaviorsRepository } from "./in-memory-behaviors-repository.ts";

export class InMemoryBehaviorsBatchRepository implements BehaviorsBatchRepository {
  public items: BehaviorBatch[] = []

  constructor(
    private behaviorsRepository: InMemoryBehaviorsRepository
  ) {}

  async create(behaviorBatch: BehaviorBatch): Promise<void> {
    this.items.push(behaviorBatch)

    DomainEvents.dispatchEventsForAggregate(behaviorBatch.id)
  }

  async save(behaviorBatch: BehaviorBatch): Promise<void> {
    this.items.push(behaviorBatch)

    const behaviorBatchIndex = this.items.findIndex(item => item.id.equals(behaviorBatch.id))
    this.items[behaviorBatchIndex] = behaviorBatch

    behaviorBatch.behaviors.forEach(behavior => {{
      const behaviorIndex = this.behaviorsRepository.items.findIndex(item => item.id.equals(behavior.id))
      this.behaviorsRepository.items[behaviorIndex] = behavior
    }})

    DomainEvents.dispatchEventsForAggregate(behaviorBatch.id)
  }
}