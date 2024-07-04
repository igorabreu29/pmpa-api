import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentPole } from "@/domain/boletim/enterprise/entities/student-pole.ts";

export function makeStudentPole(
  override: Partial<StudentPole> = {},
  id?: UniqueEntityId
) {
  return StudentPole.create({
    poleId: new UniqueEntityId(),
    studentId: new UniqueEntityId(),
    ...override
  }, id)
}