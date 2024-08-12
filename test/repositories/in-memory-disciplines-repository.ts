import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";
import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts";

export class InMemoryDisciplinesRepository implements DisciplinesRepository {
  public items: Discipline[] = []

  async findById(id: string): Promise<Discipline | null> {
    const discipline = this.items.find(item => item.id.toValue() === id)
    return discipline ?? null
  }

  async findByName(name: string): Promise<Discipline | null> {
    const discipline = this.items.find(item => item.name.value === name)
    return discipline ?? null
  }

  async findMany(page: number): Promise<{ disciplines: Discipline[]; pages: number; totalItems: number; }> {
    const PER_PAGE = 10

    const disciplines = this.items
      .slice((page - 1) * PER_PAGE, page * PER_PAGE)
      .sort((a, b) => a.name.value.localeCompare(b.name.value))

    const totalItems = this.items.length
    const pages = Math.ceil(totalItems / PER_PAGE)

    return {
      disciplines,
      pages,
      totalItems
    }
  }

  async create(discipline: Discipline): Promise<void> {
    this.items.push(discipline)
  }

  async createMany(disciplines: Discipline[]): Promise<void> {
    for (const discipline of disciplines) {
      this.items.push(discipline)
    }
  }
}