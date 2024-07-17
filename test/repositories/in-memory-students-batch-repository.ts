import { DomainEvents } from "@/core/events/domain-events.ts";
import { StudentsBatchRepository } from "@/domain/boletim/app/repositories/students-batch-repository.ts";
import { StudentBatch } from "@/domain/boletim/enterprise/entities/student-batch.ts";

export class InMemoryStudentsBatchRepository implements StudentsBatchRepository {
  public items: StudentBatch[] = []

  async create(studentBatch: StudentBatch): Promise<void> {
    this.items.push(studentBatch)

    DomainEvents.dispatchEventsForAggregate(studentBatch.id)
  }
}