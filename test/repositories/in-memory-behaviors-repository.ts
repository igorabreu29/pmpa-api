import { DomainEvents } from "@/core/events/domain-events.ts";
import { BehaviorsRepository } from "@/domain/boletim/app/repositories/behaviors-repository.ts";
import { Behavior } from "@/domain/boletim/enterprise/entities/behavior.ts";

export class InMemoryBehaviorsRepository implements BehaviorsRepository {
  public items: Behavior[] = []

  async findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string; courseId: string; }): Promise<Behavior | null> {
    const behavior = this.items.find(item => item.studentId.toValue() === studentId && item.courseId.toValue() === courseId)
    return behavior ?? null
  }

  async findById({ id }: { id: string; }): Promise<Behavior | null> {
    const behavior = this.items.find(item => item.id.toValue() === id)
    return behavior ?? null
  }

  async findManyByStudentIdAndCourseId({ studentId, courseId }: { studentId: string; courseId: string; }): Promise<Behavior[]> {
    const behaviors = this.items.filter(item => item.studentId.toValue() === studentId && item.courseId.toValue() === courseId)
    return behaviors
  }

  async create(behavior: Behavior): Promise<void> {
    this.items.push(behavior)

    DomainEvents.dispatchEventsForAggregate(behavior.id)
  }

  async update(behavior: Behavior): Promise<void> {
    const behaviorIndex = this.items.findIndex(item => item.id === behavior.id) 
    this.items[behaviorIndex] = behavior

    DomainEvents.dispatchEventsForAggregate(behavior.id)
  }

  async delete(behavior: Behavior): Promise<void> {
    const behaviorIndex = this.items.findIndex(item => item.id === behavior.id)
    this.items.splice(behaviorIndex, 1)

    DomainEvents.dispatchEventsForAggregate(behavior.id)
  }
}