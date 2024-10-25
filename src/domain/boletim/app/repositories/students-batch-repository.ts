import { StudentBatch } from "../../enterprise/entities/student-batch.ts";

export abstract class StudentsBatchRepository {
  abstract create(studentBatch: StudentBatch): Promise<void>
  abstract save(studentBatch: StudentBatch): Promise<void>
}