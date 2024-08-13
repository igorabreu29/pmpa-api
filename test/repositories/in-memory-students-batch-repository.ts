import { DomainEvents } from "@/core/events/domain-events.ts";
import { StudentsBatchRepository } from "@/domain/boletim/app/repositories/students-batch-repository.ts";
import { StudentBatch } from "@/domain/boletim/enterprise/entities/student-batch.ts";
import { InMemoryStudentsRepository } from "./in-memory-students-repository.ts";

export class InMemoryStudentsBatchRepository implements StudentsBatchRepository {
  public items: StudentBatch[] = []

  constructor (
    private studentsRepository: InMemoryStudentsRepository
  ) {}

  async create(studentBatch: StudentBatch): Promise<void> {
    this.items.push(studentBatch)

    DomainEvents.dispatchEventsForAggregate(studentBatch.id)
  }

  async save(studentBatch: StudentBatch): Promise<void> {
    this.items.push(studentBatch)

    const studentBatchIndex = this.items.findIndex(item => item.id.equals(studentBatch.id))
    this.items[studentBatchIndex] = studentBatch

    studentBatch.students.forEach(({ student }) => {{
      const studentIndex = this.studentsRepository.items.findIndex(item => item.id.equals(student.id))
      this.studentsRepository.items[studentIndex] = student
    }})

    DomainEvents.dispatchEventsForAggregate(studentBatch.id)
  }
}