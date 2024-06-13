import { Discipline } from "@/domain/enterprise/entities/discipline.ts";

export abstract class DisciplinesRepository {
  abstract findById(id: string): Promise<Discipline | null>
  abstract findByName(name: string): Promise<Discipline | null>
  abstract create(discipline: Discipline): Promise<void>
} 