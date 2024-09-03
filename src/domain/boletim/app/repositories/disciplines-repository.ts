import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts";

export abstract class DisciplinesRepository {
  abstract findById(id: string): Promise<Discipline | null>
  abstract findByName(name: string): Promise<Discipline | null>
  abstract findMany(page: number): Promise<{
    disciplines: Discipline[],
    pages: number
    totalItems: number
  }>
  abstract create(discipline: Discipline): Promise<void>
  abstract createMany(disciplines: Discipline[]): Promise<void>
  abstract save(discipline: Discipline): Promise<void>
  abstract delete(discipline: Discipline): Promise<void>
} 