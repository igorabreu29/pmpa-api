import { DisciplineByCourseIdAndDisciplineId, DisciplinesRepository } from "@/domain/app/repositories/disiciplines-repository.ts";
import { Discipline } from "@/domain/enterprise/entities/discipline.ts";

export class InMemoryDisciplinesRepository implements DisciplinesRepository {
  public items: Discipline[] = []

  async findById(id: string): Promise<Discipline | null> {
    const discipline = this.items.find(item => item.id.toValue() === id)
    return discipline ?? null
  }

  async findByName(name: string): Promise<Discipline | null> {
    const discipline = this.items.find(item => item.name === name)
    return discipline ?? null
  }

  async create(discipline: Discipline): Promise<void> {
    this.items.push(discipline)
  }
}