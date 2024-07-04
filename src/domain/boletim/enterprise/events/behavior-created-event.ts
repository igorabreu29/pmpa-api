import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { DomainEvent } from "@/core/events/domain-event.ts";
import { Behavior } from "../entities/behavior.ts";

export class BehaviorCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public behavior: Behavior

  public constructor(behavior: Behavior) {
    this.behavior = behavior
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.behavior.id
  }
}